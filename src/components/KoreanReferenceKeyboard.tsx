
import React, { useState, useEffect } from 'react';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';
import korean from 'simple-keyboard-layouts/build/layouts/korean';

// Simplified mapping from physical QWERTY key to Korean character
// This is a basic mapping and might not cover all complex IME behaviors.
const physicalToKoreanMap: { [key: string]: string } = {
  'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ', 'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
  'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ', 'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
  'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ', 'b': 'ㅠ', 'n': 'ㅜ', 'm': 'ㅡ',
  ',': ',', '.': '.', '/': '/',
  // Shifted characters
  'Q': 'ㅃ', 'W': 'ㅉ', 'E': 'ㄸ', 'R': 'ㄲ', 'T': 'ㅆ', 'O': 'ㅒ', 'P': 'ㅖ',
};

const KoreanReferenceKeyboard: React.FC = () => {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKey = event.key.toLowerCase();
      const koreanChar = physicalToKoreanMap[pressedKey];
      if (koreanChar) {
        setActiveKey(koreanChar);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setActiveKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <Keyboard
      layout={korean.layout}
      // Make it non-interactive
      disableButtonHold={true}
      disableRowButtonHold={true}
      readOnly={true}
      buttonTheme={activeKey ? [{ class: "hg-activeButton", buttons: activeKey }] : []}
    />
  );
};

export default KoreanReferenceKeyboard;
