import React, { useRef, useEffect } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import korean from 'simple-keyboard-layouts/build/layouts/korean';
import Hangul from 'hangul-js';

interface Props {
  onChange: (input: string) => void;
  input: string;
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
    console.log('Button pressed:', button);
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

    console.log('Jamo buffer before processing:', [...jamoBuffer.current]);
    const disassembled = Hangul.disassemble(button);
    const buttonIsJamo = disassembled.length > 0;
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