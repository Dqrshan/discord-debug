import fs from 'fs';
import {
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Message
} from 'discord.js';
import { Paginator, HLJS } from '../lib';
import type { Debugger } from '../';
import { Command } from '../lib/Command';

const command: Command = {
    name: 'source',
    aliases: ['src', 'file', 'cat'],
    description: 'Shows the source code of a file',
    messageRun: async (message, parent, args) => {
        await source(message, parent, args);
    },
    interactionRun: async (interaction, parent) => {
        if (!interaction.deferred) await interaction.deferReply();
        await source(
            interaction,
            parent,
            interaction.options.getString('path', true)
        );
    }
};

export default command;

const source = async (
    message: Message | ChatInputCommandInteraction,
    parent: Debugger,
    args: string
) => {
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
                    .setCustomId('debug$prev')
                    .setLabel('Prev'),
                action: ({ manager }) => manager.previousPage(),
                requirePage: true
            },
            {
                button: new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('debug$stop')
                    .setLabel('Stop'),
                action: ({ manager }) => manager.destroy(),
                requirePage: true
            },
            {
                button: new ButtonBuilder()
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId('debug$next')
                    .setLabel('Next'),
                action: ({ manager }) => manager.nextPage(),
                requirePage: true
            }
        ]);
    });
};
