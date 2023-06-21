import { type TimestampStylesString } from 'discord.js';

export class DateFormat {
    static format(date: Date | number, style?: TimestampStylesString) {
        return `<t:${Math.floor(Number(date) / 1000)}${
            style ? `:${style}` : ''
        }>`;
    }
}
