import React, { useRef, useEffect, useState } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import Hangul from 'hangul-js';

interface Props {
  onChange: (input: string) => void;
  input: string;
}

const jamoLayout = {
  default: [
    'ㅂ ㅈ ㄷ ㄱ ㅅ ㅛ ㅕ ㅑ ㅐ ㅔ',
    'ㅁ ㄴ ㅇ ㄹ ㅎ ㅗ ㅓ ㅏ ㅣ',
    'ㅋ ㅌ ㅊ ㅍ ㅠ ㅜ ㅡ , . ? !',
    '{shift} {space} {bksp}',
  ],
  shift: [
    '{shift} ㅃ ㅉ ㄸ ㄲ ㅆ ㅛ ㅕ ㅑ ㅒ ㅖ'
  ]
};

const CustomJamoKeyboard: React.FC<Props> = ({ onChange, input }) => {
  const [layoutName, setLayoutName] = useState('default');
  const jamoBuffer = useRef<string[]>([]);
  const [composedInput, setComposedInput] = useState(input);
  const currentInputRef = useRef(input);

  useEffect(() => {
    setComposedInput(input);
    currentInputRef.current = input;
  }, [input]);

  const commitInput = (nextInput: string) => {
    currentInputRef.current = nextInput;
    setComposedInput(nextInput);
    onChange(nextInput);
  };

  const onKeyPress = (button: string) => {
    let currentInput = currentInputRef.current;

    if (layoutName === 'shift') {
      setLayoutName('default');
    }

    if (button === '{shift}') {
      setLayoutName(layoutName === 'default' ? 'shift' : 'default');
      return;
    }

    if (button === '{space}') {
      jamoBuffer.current.length = 0;
      commitInput(currentInput + ' ');
      return;
    }

    if (button === '{bksp}') {
      jamoBuffer.current.length = 0;
      commitInput(currentInput.slice(0, -1));
      return;
    }

    const disassembled = Hangul.disassemble(button);
    const isJamo =
      disassembled.length > 0 &&
      (Hangul.isConsonant(disassembled[0]) || Hangul.isVowel(disassembled[0]));

    if (!isJamo) {
      jamoBuffer.current.length = 0;
      commitInput(currentInput + button);
      return;
    }

    jamoBuffer.current.push(button);

    const composed = Hangul.assemble(jamoBuffer.current);

    if (jamoBuffer.current.length > 1) {
      currentInput = currentInput.slice(0, -1); // Overwrite last character with composed syllable
    }

    if (composed.length > 1) {
      const remainder = composed.slice(1);
      jamoBuffer.current = Hangul.disassemble(remainder);
      commitInput(currentInput + composed);
      return;
    }

    commitInput(currentInput + composed);
  };

  return (
    <div>
      <Keyboard
        layout={jamoLayout}
        layoutName={layoutName}
        onKeyPress={onKeyPress}
        input={composedInput}
        display={{
          '{shift}': 'Shift',
          '{space}': 'Space',
          '{bksp}': 'Backspace'
        }}
      />
    </div>
  );
};

export default CustomJamoKeyboard;