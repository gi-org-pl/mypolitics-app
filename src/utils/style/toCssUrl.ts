// An address as a CSS `url()` value. The address is written as a quoted
// string, and every character that could end the string or the line is
// escaped, so an address can never be read as anything but an address.
export const toCssUrl = (address: string): string =>
  `url("${address.replace(
    /["\\\n\r\f]/g,
    (character) => `\\${character.codePointAt(0)?.toString(16)} `,
  )}")`;
