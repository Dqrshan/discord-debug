import Discord, { Message } from 'discord.js';
import type { Debugger } from '../';
import { Paginator, inspect, isInstance, isGenerator } from '../lib';

export async function js(message: Message, parent: Debugger, args: string) {
    // @ts-ignore
    const { client } = parent; // for eval
    // const isMessage = message instanceof Message;
    // if (isMessage && !args) {
    //     return message.reply("Missing Arguments.");
    // }
    if (!args) {
        return message.reply('Missing Arguments.');
    }

    const res = new Promise((resolve) => resolve(eval(args ?? '')));
    let typeOf;
    const result = await res
        .then(async (output) => {
            typeOf = typeof output;

            async function prettify(target: any) {
                if (
                    target instanceof Discord.Embed ||
                    target instanceof Discord.EmbedBuilder
                ) {
                    await message.reply({ embeds: [target] });
                } else if (isInstance(target, Discord.Attachment)) {
                    await message.reply({
                        files:
                            target instanceof Discord.Collection
                                ? target.toJSON()
                                : [target]
                    });
                }
            }

            if (isGenerator(output)) {
                for (const value of output as any) {
                    prettify(value);

                    if (typeof value === 'function') {
                        await message.reply(value.toString());
                    } else if (typeof value === 'string')
                        await message.reply(value);
                    else {
                        await message.reply(
                            inspect(value, { depth: 1, maxArrayLength: 200 })
                        );
                    }
                }
            }

            prettify(output);

            if (typeof output === 'function') {
                typeOf = 'object';
                return output.toString();
            } else if (typeof output === 'string') {
                return output;
            }
            return inspect(output, { depth: 1, maxArrayLength: 200 });
        })
        .catch((e) => {
            typeOf = 'object';
            return e.toString();
        });

    const msg = new Paginator(message, result || '', parent, {
        lang: 'js',
        noCode: typeOf !== 'object'
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

export const aliases = ['javascript', 'eval'];
