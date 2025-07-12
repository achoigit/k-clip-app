import { act } from '@testing-library/react';
import Hangul from 'hangul-js';

describe('KoreanKeyboard onKeyPress', () => {
  let onChangeMock: jest.Mock;
  let handleShiftMock: jest.Mock;
  let onKeyPress: (button: string) => void;
  let jamoBuffer: string[];
  let composedInput: string;

  beforeEach(() => {
    onChangeMock = jest.fn();
    handleShiftMock = jest.fn();
    jamoBuffer = [];
    composedInput = '';

    onKeyPress = (button: string) => {
      if (button === '{shift}' || button === '{lock}') {
        handleShiftMock();
        return;
      }

      // Backspace deletes the last composed char and resets the jamo buffer
      if (button === '{bksp}') {
        if (jamoBuffer.length > 0) {
          jamoBuffer = []
        }
        composedInput = composedInput.slice(0, -1);
        onChangeMock(composedInput);
        return;
      }

      // Non-Hangul chars append directly to the input and resets the buffer
      if (!Hangul.isConsonant(button) && !Hangul.isVowel(button)) {
        if (jamoBuffer.length > 0) {
          jamoBuffer = [];
        }
        composedInput += button;
        onChangeMock(composedInput);
        return;
      }

      // Hangul characters assemble into a syllable with up to 4 jamo characters via the jamo buffer
      jamoBuffer.push(button);
      const syllable = Hangul.assemble(jamoBuffer);
      if (jamoBuffer.length === 1) {
        composedInput += syllable;
      } else if (jamoBuffer.length > 1 && jamoBuffer.length <= 4) {
        composedInput = composedInput.slice(0, -1) + syllable; // Replace last character with assembled syllable
        if (jamoBuffer.length === 4) {
          jamoBuffer = [];
        }
      }
      onChangeMock(composedInput);
    };
  });

  it('should assemble Hangul Letter Kiyeok Jamos', () => {
    const result = Hangul.assemble(['ㄱ', 'ㅏ']);
    expect(result.length).toBe(1);
    expect(result).toBe('가');
    const firstJamo = Hangul.disassemble(result)[0];
    const secondJamo = Hangul.disassemble(result)[1];
    expect(firstJamo).toBe('ㄱ');
    expect(secondJamo).toBe('ㅏ');
    expect(firstJamo.codePointAt(0)).toBe(12593); // 'ㄱ'
    expect(secondJamo.codePointAt(0)).toBe(12623); // 'ㅏ'
    expect(result.codePointAt(0)).toBe(44032); // '가'
  });

  it.skip('should assemble Hangul Choseong Kiyeok Jamos', () => {
    const result = Hangul.assemble([String.fromCharCode(4352), String.fromCharCode(4449)]);
    expect(result.length).toBe(1);
    expect(result).toBe('가');
  });

  it('should assemble three jamo', () => {
    const result = Hangul.assemble(['ㄱ', 'ㅏ', 'ㄴ']);
    expect(result).toBe('간');
    expect(result.length).toBe(1);
  });

  it('should assemble two, four, three jamo', () => {
    const result = Hangul.assemble(['ㅈ', 'ㅜ', 'ㅎ', 'ㅗ', 'ㅏ', 'ㅇ', 'ㅅ', 'ㅐ', 'ㄱ']);
    expect(result).toBe('주황색')
    expect(result.length).toBe(3);
  });

  it('should not assemble', () => {
    const result = Hangul.assemble(['ㅏ', 'ㄱ']);
    expect(result).toBe('ㅏㄱ');
    expect(result.length).toBe(2);
  });

  it('should handle Hangul key presses correctly', () => {
    act(() => {
      onKeyPress('ㄱ');
      onKeyPress('ㅏ');
    });

    expect(onChangeMock).toHaveBeenLastCalledWith('가');
  });

  it('should handle backspace correctly', () => {
    act(() => {
      onKeyPress('ㄱ');
      onKeyPress('ㅏ');
      onKeyPress('{bksp}');
    });

    expect(onChangeMock).toHaveBeenLastCalledWith('');
  });

  it('should handle non-Hangul keys correctly', () => {
    act(() => {
      onKeyPress('ㄱ');
      onKeyPress('ㅏ');
      onKeyPress('!');
    });

    expect(onChangeMock).toHaveBeenLastCalledWith('가!');
  });

  it('should handle shift key correctly', () => {
    act(() => {
      onKeyPress('{shift}');
    });

    expect(handleShiftMock).toHaveBeenLastCalledWith();
  });
});