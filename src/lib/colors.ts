export const bold = (text: string) => `\x1b[1m${text}\x1b[22m`;
export const italic = (text: string) => `\x1b[3m${text}\x1b[23m`;

export const white = (text: string) => `\x1b[37m${text}\x1b[39m`;
export const black = (text: string) => `\x1b[30m${text}\x1b[39m`;

export const red = (text: string) => `\x1b[91m${text}\x1b[39m`;
export const green = (text: string) => `\x1b[92m${text}\x1b[39m`;
export const yellow = (text: string) => `\x1b[93m${text}\x1b[39m`;
export const blue = (text: string) => `\x1b[94m${text}\x1b[39m`;

export const bgRed = (text: string) => `\x1b[101m${text}\x1b[49m`;
export const bgGreen = (text: string) => `\x1b[102m${text}\x1b[49m`;
export const bgYellow = (text: string) => `\x1b[103m${text}\x1b[49m`;
export const bgBlue = (text: string) => `\x1b[104m${text}\x1b[49m`;
