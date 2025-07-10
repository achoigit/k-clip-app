declare module 'hangul-js' {
  interface Hangul {
    assemble(jamoArray: string[]): string;
    disassemble(hangulString: string): string[];
    // Add other methods from hangul-js here if you use them
  }
  const Hangul: Hangul;
  export default Hangul;
}