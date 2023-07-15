import util from 'node:util';
import { Collection, ColorResolvable, EmbedBuilder } from 'discord.js';
import { escapeCodeBlock } from 'discord.js';

export const plural = (num: number, str: string) => {
    return num === 1 ? `${num} ${str}` : `${num} ${str}s`;
};

export const join = (arr: any[], sep: string, last: string) => {
    if (arr.length <= 1) return arr.join(sep);
    return arr.reduce((text, cur, idx) =>
        [text, cur].join(idx === arr.length - 1 ? last : sep)
    );
};

export const capitalize = (str: string) =>
    str[0].toUpperCase() + str.slice(1).toLowerCase();

export class codeBlock {
    static construct(content: string, lang?: string) {
        return `\`\`\`${content ? lang || '' : ''}\n${escapeCodeBlock(
            content
        )}\n\`\`\``;
    }

    static parse(content: string) {
        const result = content.match(/^```(.*?)\n(.*?)```$/ms);
        return result ? result.slice(0, 3).map((el) => el.trim()) : null;
    }
}

export const escapeRegex = (string: string) => {
    const str = String(string);
    const cpList = Array.from(str[Symbol.iterator]());
    const cuList = [];
    for (const c of cpList) {
        if ('^$\\.*+?()[]{}|'.indexOf(c) !== -1) {
            cuList.push('\\');
        }
        cuList.push(c);
    }
    const L = cuList.join('');
    return L;
};

export const isGenerator = (target: any) =>
    target &&
    typeof target.next === 'function' &&
    typeof target.throw === 'function';

export const inspect = (value: any, obj: any) => {
    return util.inspect(value, obj);
};

export const isInstance = (target: any, Class: any) => {
    if (
        target instanceof Collection &&
        target.map((f) => f instanceof Class).includes(false)
    ) {
        return false;
    } else if (
        Array.isArray(target) &&
        target.map((f) => f instanceof Class).includes(false)
    ) {
        return false;
    } else if (!(target instanceof Class)) return false;
    else return true;
};

export const typeFind = (
    argument: any
): 'NaN' | 'Class' | 'Function' | string => {
    if (typeof argument === 'number' && isNaN(argument)) return 'NaN';
    const parsed = Object.prototype.toString.apply(argument);
    const obj = parsed.slice(1, 7);
    if (obj !== 'object') return typeof argument;
    const type = parsed.slice(8, parsed.length - 1);
    if (type === 'Function') {
        return /^class[\s{]/.test(String(argument)) ? 'Class' : 'Function';
    } else return type;
};

export const table = (obj: Record<string, any>) => {
    clean(obj);
    const max =
        Object.keys(obj)
            .map((e) => e.toString().length)
            .sort((a, b) => b - a)[0]! + 4;

    return Object.keys(obj)
        .map((key) => `${key}${' '.repeat(max - key.length)}:: ${obj[key]}`)
        .join('\n');
};

const clean = (obj: Record<string, any>) => {
    for (const propName in obj) {
        if (!obj[propName]) {
            delete obj[propName];
        }
    }
};

export const count = (argument: any) => {
    if (
        argument instanceof Map ||
        argument instanceof Set ||
        argument instanceof Collection
    ) {
        argument = Array.from(argument.values());
    }
    if (Array.isArray(argument)) {
        const typed = argument.map((el) =>
            el?.constructor ? el.constructor.name : typeFind(el)
        );
        const obj: any = {};

        for (const t of typed) {
            if (!obj[t]) obj[t] = 0;
            obj[t]++;
        }

        const items = Object.keys(obj).map((el) => {
            return { name: el, count: obj[el] };
        });
        const total = items.reduce(
            (previous, current) => previous + current.count,
            0
        );
        return items
            .map((el) => {
                return {
                    name: el.name,
                    count: el.count,
                    ratio: ((el.count / total) * 100).toFixed(1)
                };
            })
            .sort((a, b) => Number(b.ratio) - Number(a.ratio));
    }
    return null;
};

export const warnEmbed = (
    header: string,
    message: string,
    type: WarnType
): EmbedBuilder => {
    const props: Record<WarnType, WarnProps> = {
        ERROR: {
            icon: 'https://cdn.discordapp.com/emojis/1119237178975866881.webp?size=96&quality=lossless',
            color: 'Red'
        },
        WARN: {
            icon: 'https://cdn.discordapp.com/emojis/1119237147849916448.webp?size=96&quality=lossless',
            color: 'Yellow'
        },
        SUCCESS: {
            icon: 'https://cdn.discordapp.com/emojis/1119236913623207966.webp?size=96&quality=lossless',
            color: 'Green'
        }
    };
    return new EmbedBuilder()
        .setAuthor({
            name: header,
            iconURL: props[type].icon
        })
        .setColor(props[type].color)
        .setDescription(message);
};

type WarnType = 'ERROR' | 'WARN' | 'SUCCESS';
type WarnProps = {
    icon: string;
    color: ColorResolvable;
};
