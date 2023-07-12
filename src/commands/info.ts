import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    GatewayIntentBits,
    IntentsBitField,
    Message,
    version as djsVersion
} from 'discord.js';
import type { Debugger } from '..';
import { System, DateFormat, commands } from '../lib';
import { Command } from '../lib/Command';

const command: Command = {
    name: commands.info.name,
    description: commands.info.description,
    messageRun: async (message, parent, _args) => {
        await info(message, parent);
    },
    interactionRun: async (interaction, parent) => {
        if (!interaction.deferred) await interaction.deferReply();
        await info(interaction, parent);
    }
};

export default command;

const info = async (
    message: Message | ChatInputCommandInteraction,
    parent: Debugger
) => {
    const intents = new IntentsBitField(parent.client.options.intents);
    const embed = new EmbedBuilder()
        .setTitle(
            `discord.js \`${djsVersion}\`, \`Node.js ${process.version}\` on \`${process.platform}\``
        )
        .setColor(parent.options?.themeColor!)
        .addFields(
            {
                name: `Process start`,
                value: `${DateFormat.format(System.processReadyAt(), 'R')}`,
                inline: true
            },
            {
                name: 'Bot ready',
                value: `${DateFormat.format(parent.client.readyAt!, 'R')}`,
                inline: true
            }
        );

    let summary = `- Using ${System.memory().rss} at this process.\n`;
    const cache = `${parent.client.guilds.cache.size.toLocaleString()} guild(s) and ${parent.client.guilds.cache
        .reduce((a, g) => a + g.memberCount, 0)
        .toLocaleString()} member(s)`;

    if (parent.client.shard) {
        const guilds = await parent.client.shard
            .fetchClientValues('guilds.cache.size')
            .then((r) => {
                const out = r as number[];
                return out.reduce((prev, val) => prev + val, 0);
            });
        summary += `\t- Running on PID ${
            process.pid
        } for this client, and running on PID ${
            process.ppid
        } for the parent process.\n\nThis bot is sharded in ${parent.client.shard.count.toLocaleString()} shard(s) and running in ${guilds.toLocaleString()} guild(s).\nCan see ${cache} in this client.`;
    } else {
        summary += `\t- Running on PID ${process.pid}\n\nThis bot is not sharded and can see ${cache}.`;
    }

    embed
        .setDescription(summary)
        .addFields({
            name: 'Privileged Intents',
            value: [
                GatewayIntentBits.GuildPresences,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.MessageContent
            ]
                .map(
                    (u) =>
                        `- ${intents.has(u) ? `✅` : `❌`} \`${
                            GatewayIntentBits[u]
                        }\``
                )
                .join('\n')
        })
        .setFooter({
            text: `Average websocket latency: ${parent.client.ws.ping}ms`
        });

    return message instanceof Message
        ? message.reply({ embeds: [embed] })
        : await message.editReply({
              embeds: [embed]
          });
};
