import Discord, { Message } from 'discord.js';
import type { Debugger } from '../';
import { Paginator, count, inspect, table, typeFind } from '../lib';

export async function jsi(message: Message, parent: Debugger, args: string) {
    // @ts-ignore
    const { client } = parent;
    if (!args) return message.reply('Missing Arguments.');

    const res = new Promise((resolve) => resolve(eval(args ?? '')));
    let msg!: Paginator;
    await res
        .then((output: any) => {
            const typeofTheRes = typeFind(output);
            const overview = inspect(output, { depth: -1 });
            const constructorName =
                output && output.constructor
                    ? Object.getPrototypeOf(output.constructor).name
                    : null;
            const arrCount = count(output);
            msg = new Paginator(
                message,
                `=== ${overview.slice(0, 100)}${
                    overview.length > 100 ? '...' : ''
                } ===\n\n${table({
                    Type: `${typeof output}(${typeofTheRes})`,
                    Name: constructorName || null,
                    Length: typeof output === 'string' && output.length,
                    Size:
                        output instanceof Discord.Collection
                            ? output.size
                            : null,
                    'Content Types': arrCount
                        ? arrCount
                              .map((el) => `${el.name} (${el.ratio}％)`)
                              .join(', ')
                        : null
                })}`,
                parent,
                { lang: 'prolog' }
            );
        })
        .catch((e) => {
            msg = new Paginator(message, e.stack, parent, { lang: 'js' });
        });

    await msg.init();
    await msg.addAction([
        {
            button: new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Danger)
                .setCustomId('dokdo$prev')
                .setLabel('Prev'),
            action: ({ manager }) => manager.previousPage(),
            requirePage: true
        },
        {
            button: new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setCustomId('dokdo$stop')
                .setLabel('Stop'),
            action: ({ manager }) => manager.destroy(),
            requirePage: true
        },
        {
            button: new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Success)
                .setCustomId('dokdo$next')
                .setLabel('Next'),
            action: ({ manager }) => manager.nextPage(),
            requirePage: true
        }
    ]);
}
