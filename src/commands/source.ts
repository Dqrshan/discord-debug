import fs from 'fs';
import {
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Message
} from 'discord.js';
import { Paginator, HLJS, Tree, commands } from '../lib';
import type { Debugger } from '../';
import { Command } from '../lib/Command';
import path from 'node:path';

const command: Command = {
    name: commands.source.name,
    aliases: commands.source.aliases,
    description: commands.source.description,
    messageRun: async (message, parent, args) => {
        await source(message, parent, args);
    },
    interactionRun: async (interaction, parent) => {
        if (!interaction.deferred) await interaction.deferReply();
        await source(
            interaction,
            parent,
            interaction.options.getString('path', false)
        );
    }
};

export default command;

const formatView = (filename: string) => {
    if (filename.endsWith('/')) filename = filename.slice(0, -1);
    const str = Tree.isHidden(filename.split('/')[0])
        ? `\n[Hidden]`
        : Tree.isIgnored(path.join(process.cwd(), filename))
        ? `\n[Ignored by .gitignore]`
        : Tree.print(filename);
    return `${process.cwd()}/${filename}/\n📂 ${
        filename.split('/')[filename.split('/').length - 1]
    }${str}`;
};

const source = async (
    message: Message | ChatInputCommandInteraction,
    parent: Debugger,
    args: string | null
) => {
    const filename = args;
    let msg;
    if (!filename) {
        msg = new Paginator(
            message,
            `${process.cwd()}/` + Tree.print(process.cwd()),
            parent,
            { lang: 'yaml' }
        );
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
        return;
    }
    const isDirectory = fs.statSync(filename).isDirectory();
    if (isDirectory) {
        msg = new Paginator(message, formatView(filename), parent, {
            lang: 'yaml'
        });
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
        return;
    }
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
