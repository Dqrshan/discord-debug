import {
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Client,
    Message
} from 'discord.js';
import type { Debugger } from '../';
import { Paginator, inspect } from '../lib';
import { Command } from '../lib/Command';

const command: Command = {
    name: 'shard',
    description: 'Evaluates a javascript code on all shards',
    messageRun: async (message, parent, args) => {
        await shard(message, parent, args);
    },
    interactionRun: async (interaction, parent) => {
        if (!interaction.deferred) await interaction.deferReply();
        await shard(
            interaction,
            parent,
            interaction.options.getString('code')!
        );
    }
};

export default command;

const shard = async (
    message: Message | ChatInputCommandInteraction,
    parent: Debugger,
    args: string
) => {
    const isMsg = message instanceof Message;
    if (!args) return message.reply('Missing Arguments.');
    if (!parent.client.shard)
        return isMsg
            ? message.reply('Shard Manager not found.')
            : await message.editReply('Shard Manage not found.');
    let evalFunction: (client: Client) => any;
    try {
        // eslint-disable-next-line no-new-func
        evalFunction = Function('client', `return ${args}`) as (
            client: Client
        ) => any; // catch syntax error
    } catch (err: any) {
        return isMsg
            ? message.reply(err.toString())
            : await message.editReply(err.toString());
    }
    const result = await parent.client.shard
        .broadcastEval(evalFunction)
        .then((el: any) => el)
        .catch((e: any) => e.toString());
    let msg;
    if (!Array.isArray(result)) {
        msg = new Paginator(message, result, parent, { lang: 'js' });
    } else {
        let sum;
        if (typeof result[0] === 'number') {
            sum = result.reduce((prev, val) => prev + val, 0);
        } else if (Array.isArray(result[0])) {
            sum = result.reduce((prev, val) => prev.concat(val), []);
        }
        msg = new Paginator(
            message,
            `// TOTAL\n${inspect(sum, {
                depth: 1,
                maxArrayLength: 50
            })}\n\n${result
                .map(
                    (value, index) =>
                        `// #${index} SHARD\n${inspect(value, {
                            depth: 1,
                            maxArrayLength: 100
                        })}`
                )
                .join('\n')}`,
            parent,
            { lang: 'js' }
        );
    }

    await msg.init();
    await msg.addAction([
        {
            button: new ButtonBuilder()
                .setStyle(ButtonStyle.Primary)
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
                .setStyle(ButtonStyle.Success)
                .setCustomId('debug$next')
                .setLabel('Next'),
            action: ({ manager }) => manager.nextPage(),
            requirePage: true
        }
    ]);
};
