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
    'ㅋ ㅌ ㅊ ㅍ ㅠ ㅜ ㅡ',
    '{shift} {space} {return} {bksp} {clear}',
  ],
  shift: [
    'ㅃ ㅉ ㄸ ㄲ ㅆ ㅛ ㅕ ㅑ ㅒ ㅖ {shift}'
  ]
};

const CustomJamoKeyboard: React.FC<Props> = ({ onChange, input }) => {
  const [layoutName, setLayoutName] = useState('default');
  const jamoBuffer = useRef<string[]>([]);
  const composedInput = useRef<string>(input);

  useEffect(() => {
    composedInput.current = input;
  }, [input]);

  const onKeyPress = (button: string) => {
    console.log('Button pressed:', button, ' code:', button.charCodeAt(0), ' current input:', composedInput.current, ' jamo buffer:', jamoBuffer.current);

    if (button === '{shift}') {
      setLayoutName(layoutName === 'default' ? 'shift' : 'default');
      return;
    }

    if (button === '{space}') {
      composedInput.current += ' ';
      onChange(composedInput.current);
      return;
    }

    if (button === '{return}') {
      composedInput.current += '\n';
      onChange(composedInput.current);
      return;
    }

    if (button === '{bksp}') {
      if (jamoBuffer.current.length > 0) {
        jamoBuffer.current.length = 0;
      }
      composedInput.current = composedInput.current.slice(0, -1);
      onChange(composedInput.current);
      return;
    }

    if (button === '{clear}') {
      jamoBuffer.current.length = 0;
      composedInput.current = '';
      onChange(composedInput.current);
      return;
    }

    const disassembled = Hangul.disassemble(button);
    const isJamo =
      disassembled.length > 0 &&
      (Hangul.isConsonant(disassembled[0]) || Hangul.isVowel(disassembled[0]));

    if (!isJamo) {
      if (jamoBuffer.current.length > 0) {
        jamoBuffer.current.length = 0;
      }
      composedInput.current += button;
      onChange(composedInput.current);
      return;
    }

    jamoBuffer.current.push(disassembled[0]);
    const composed = Hangul.assemble(jamoBuffer.current);
    if (jamoBuffer.current.length === 1) {
      composedInput.current += composed;
    } else if (jamoBuffer.current.length > 1 && jamoBuffer.current.length <= 4) {
      composedInput.current = composedInput.current.slice(0, -1) + composed;
      if (jamoBuffer.current.length === 4) {
        jamoBuffer.current.length = 0;
      }
    }
    onChange(composedInput.current);
  };

  return (
    <div>
      <Keyboard
        layout={jamoLayout}
        layoutName={layoutName}
        onKeyPress={onKeyPress}
        onChange={onChange}
        input={composedInput.current}
        keyboardRef={(r) => (jamoBuffer.current = r ? [] : jamoBuffer.current)}
        display={{
          '{shift}': 'Shift',
          '{space}': 'Space',
          '{return}': 'Enter',
          '{bksp}': 'Backspace',
          '{clear}': 'Clear'
        }}
      />
    </div>
  );
};

export default CustomJamoKeyboard;