import fs from 'fs';
import { ButtonBuilder, ButtonStyle, Message } from 'discord.js';
import { Paginator, HLJS } from '../lib';
import type { Debugger } from '../';

export async function source(message: Message, parent: Debugger, args: string) {
    if (!args) return message.reply('Missing Arguments.');
    const filename = args;
    let msg;
    fs.readFile(filename, async (err, data) => {
        if (err) {
            msg = new Paginator(message, err.toString(), parent, {
                lang: 'js'
            });
        } else {
            msg = new Paginator(message, data.toString(), parent, {
                lang: HLJS.getLang(filename.split('.').pop())
            });
        }
        await msg.init();
        await msg.addAction([
            {
                button: new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId('dokdo$prev')
                    .setLabel('Prev'),
                action: ({ manager }) => manager.previousPage(),
                requirePage: true
            },
            {
                button: new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('dokdo$stop')
                    .setLabel('Stop'),
                action: ({ manager }) => manager.destroy(),
                requirePage: true
            },
            {
                button: new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('dokdo$next')
                    .setLabel('Next'),
                action: ({ manager }) => manager.nextPage(),
                requirePage: true
            }
        ]);
    });
}
