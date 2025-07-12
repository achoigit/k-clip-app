import React, { useRef, useEffect } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import korean from 'simple-keyboard-layouts/build/layouts/korean';
import Hangul from 'hangul-js';

interface Props {
  onChange: (input: string) => void;
  input: string;
}

function jamoToStandardJamo(char: string): string {
  const code = char.codePointAt(0);
  // Custom mapping for 4363 → 'ㅇ'
  if (code === 0x111B) return String.fromCharCode(0x3147);
  // Choseong: U+1100–U+1112
  const choseongMap = [
    0x3131, 0x3132, 0x3134, 0x3137, 0x3138, 0x3139, 0x3141, 0x3142, 0x3143,
    0x3145, 0x3146, 0x3147, 0x3148, 0x3149, 0x314a, 0x314b, 0x314c, 0x314d, 0x314e
  ];
  if (code && code >= 0x1100 && code <= 0x1112) {
    return String.fromCharCode(choseongMap[code - 0x1100]);
  }
  // Jungseong: U+1161–U+1175 → U+314F–U+3163
  if (code && code >= 0x1161 && code <= 0x1175) {
    return String.fromCharCode(code - 0x1161 + 0x314F);
  }
  return char;
}

const KoreanKeyboard: React.FC<Props> = ({ onChange, input }) => {
  const keyboard = useRef<any>(null);
  const jamoBuffer = useRef<string[]>([]);
  const composedInput = useRef<string>(input);

  useEffect(() => {
    composedInput.current = input;
  }, [input]);

  const handleShift = () => {
    // Implement shift logic if needed
  };

  const onKeyPress = (button: string) => {
    console.log('Button pressed:', button, ' code:', button.charCodeAt(0));
    if (button === '{shift}' || button === '{lock}') {
      handleShift();
      return;
    }

    console.log('Composed input before:', composedInput.current);
    // Backspace deletes the last composed char and resets the jamo buffer
    if (button === '{bksp}') {
      if (jamoBuffer.current.length > 0) {
        jamoBuffer.current.length = 0;
      }
      composedInput.current = composedInput.current.slice(0, -1);
      onChange(composedInput.current);
      return;
    }

    const buttonJamo = jamoToStandardJamo(button);
    console.log('Jamo buffer before processing:', [...jamoBuffer.current]);
    const disassembled = Hangul.disassemble(buttonJamo);
    const buttonIsJamo = disassembled.length > 0 && Hangul.isConsonant(disassembled[0]) || Hangul.isVowel(disassembled[0]);
    console.log('Button is Jamo:', buttonIsJamo, 'Disassembled:', disassembled);

    // Non-Hangul chars append directly to the input and resets the buffer
    if (!buttonIsJamo) {
      console.log('Non-Hangul character:', button);
      if (jamoBuffer.current.length > 0) {
        jamoBuffer.current.length = 0;
      }
      composedInput.current += button;
      onChange(composedInput.current);
      return;
    }

    console.log('Jamo buffer before push:', [...jamoBuffer.current]);
    // Hangul characters assemble into a syllable with up to 4 jamo characters via the jamo buffer
    jamoBuffer.current.push(disassembled[0]);
    console.log('Jamo buffer after push:', [...jamoBuffer.current]);
    const syllable = Hangul.assemble(jamoBuffer.current);
    console.log('Syllable:', syllable, 'Buffer:', jamoBuffer.current);
    if (jamoBuffer.current.length === 1) {
      composedInput.current += syllable;
    } else if (jamoBuffer.current.length > 1 && jamoBuffer.current.length <= 4) {
      composedInput.current = composedInput.current.slice(0, -1) + syllable;
      if (jamoBuffer.current.length === 4) {
        jamoBuffer.current.length = 0;
      }
    }
    onChange(composedInput.current);
  };

  const handleKeyboardInternalChange = (_newInput: string) => {};

  return (
    <Keyboard
      keyboardRef={r => (keyboard.current = r)}
      layoutName="default"
      layout={korean.layout}
      onKeyPress={onKeyPress}
      onChange={handleKeyboardInternalChange}
      input={input}
    />
  );
};

export default KoreanKeyboard;