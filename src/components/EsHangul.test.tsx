import { getChoseong, assemble, disassemble } from 'es-hangul';


// Choseong, jungseong, and jongseong are the three components that make up a Korean Hangul syllable:
// Choseong (초성): The initial consonant of a syllable (e.g., ㄱ, ㄴ, ㅂ).
// Jungseong (중성): The medial vowel of a syllable (e.g., ㅏ, ㅗ, ㅜ).
// Jongseong (종성): The final consonant (if any) of a syllable (e.g., ㄱ, ㄴ, ㅁ, or empty).
// A Hangul syllable is typically structured as:
// Choseong + Jungseong (+ Jongseong)
// For example, the syllable '강' is composed of ㄱ (choseong), ㅏ (jungseong), and ㅇ (jongseong).

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

it('should return the correct Choseong for a given Hangul word', () => {
  const searchWord = '라면';
  const userInput = 'ㄹㅁ';

  const result = getChoseong(searchWord); // ㄹㅁ
  expect(result).toBe(userInput);
});

it('should assemble Hangul Letter Kiyeok Jamos', () => {
  const result = assemble(['ㄱ', 'ㅏ']);
  expect(result.length).toBe(1);
  expect(result).toBe('가');
  const firstJamo = disassemble(result)[0];
  const secondJamo = disassemble(result)[1];
  expect(firstJamo).toBe('ㄱ');
  expect(secondJamo).toBe('ㅏ');
  expect(firstJamo.codePointAt(0)).toBe(12593); // 'ㄱ'
  expect(secondJamo.codePointAt(0)).toBe(12623); // 'ㅏ'
  expect(result.codePointAt(0)).toBe(44032); // '가'
});

it('should convert and assemble Hangul Choseong and Jungseong Jamos', () => {
  const firstJamo = jamoToStandardJamo(String.fromCharCode(4352)); // 'ㄱ'
  const secondJamo = jamoToStandardJamo(String.fromCharCode(4449)); // 'ㅏ'
  const thirdJamo = jamoToStandardJamo(String.fromCharCode(4363)); // 'ㅇ'
  const result = assemble([firstJamo, secondJamo, thirdJamo]);
  expect(result.length).toBe(1);
  expect(result).toBe('강');
});

it('should convert and assemble Hangul Choseong, Jungseong, and Jongseong Jamos', () => {
  const firstJamo = jamoToStandardJamo(String.fromCharCode(4370)); // 'ᄒ'
  const secondJamo = jamoToStandardJamo(String.fromCharCode(4457)); // 'ᅩ'
  const thirdJamo = jamoToStandardJamo(String.fromCharCode(4449)); // 'ㅏ'
  const fourthJamo = jamoToStandardJamo(String.fromCharCode(4363)); // 'ㅇ'
  const result = assemble([firstJamo, secondJamo, thirdJamo, fourthJamo]);
  expect(result.length).toBe(1);
  expect(result).toBe('황');
});
