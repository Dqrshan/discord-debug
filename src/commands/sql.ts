import {
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Message
} from 'discord.js';
import { Command } from '../lib/Command';
import { Debugger } from '..';
import { AsciiTable3 } from 'ascii-table3';
import { Paginator, plural } from '../lib';
import { createConnection } from 'mysql2';

const command: Command = {
    name: 'sql',
    description: 'Executes a SQL query',
    aliases: ['query'],
    messageRun: async (message, parent, args) => {
        await sql(message, parent, args);
        return;
    },
    interactionRun: async (interaction, parent) => {
        if (!interaction.deferred) await interaction.deferReply();
        await sql(
            interaction,
            parent,
            interaction.options.getString('query', true)
        );
        return;
    }
};

export default command;

const sql = async (
    message: Message | ChatInputCommandInteraction,
    parent: Debugger,
    args: string
) => {
    if (!parent.options || !parent.options.sqlConnectionOptions) {
        return message instanceof Message
            ? message.reply('SQL connection options not provided')
            : await message.editReply('SQL connection options not provided');
    }
    const connection = createConnection(parent.options?.sqlConnectionOptions!);
    // const isMsg = message instanceof Message;
    const table = new AsciiTable3();

    const msg = new Paginator(message, `mysql> ${args}\n`, parent, {
        lang: 'sql'
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
            action: ({ manager }) => {
                connection.destroy();
                manager.destroy();
            },
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
    let hrTime = process.hrtime();
    connection.query(args, async (err, result, fields) => {
        // console.log(err, result, fields);
        if (err) {
            msg.add(`\n${err}`);
            return connection.destroy();
        }
        hrTime = process.hrtime(hrTime);
        const time =
            hrTime[0] > 0
                ? `${(hrTime[0] + hrTime[1] / 1000000000).toFixed(2)} sec`
                : `${(hrTime[1] / 1000000000).toFixed(2)} sec`;

        if (fields) {
            table.setHeading(...fields.map((field) => field.name));
        }
        if (result instanceof Array) {
            result.forEach((row) => {
                table.addRow(...Object.values(row));
            });
        } else {
            msg.add(
                `\n${result.affectedRows} ${plural(
                    result.affectedRows,
                    'row'
                )} affected (${time})`
            );
        }

        if (table && table.getRows()[0]) {
            msg.add(`\n${table.toString()}`);
        }
        if (result instanceof Array) {
            msg.add(
                `\n${result.length} ${plural(
                    result.length,
                    'row'
                )} in set (${time})`
            );
        }
        return connection.destroy();
    });

    return;
};
