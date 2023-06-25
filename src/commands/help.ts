import { ChatInputCommandInteraction, Message } from 'discord.js';
import { Command, commands } from '../lib/Command';
import { EmbedBuilder } from '@discordjs/builders';

const command: Command = {
    name: 'help',
    aliases: ['h'],
    description: 'List of all debug commands',
    messageRun: async (message, _, __) => {
        await help(message);
    },
    interactionRun: async (interaction, _) => {
        await help(interaction);
    }
};

export default command;

const help = async (ctx: Message | ChatInputCommandInteraction) => {
    const embed = new EmbedBuilder()
        .setTitle('Debugger Help')
        .setFields(
            commands
                .sort((a, b) => a.description.length - b.description.length)
                // .filter((c) => c.name !== 'info')
                .map((c) => {
                    return {
                        name: `${c.name}${
                            c.aliases
                                ? ` (${c.aliases
                                      .map((a) => `\`${a}\``)
                                      .join(', ')})`
                                : ''
                        }`,
                        value: `${c.description}`,
                        inline: true
                    };
                })
        )
        .setThumbnail(ctx.client.user.displayAvatarURL())
        .setFooter({
            text: `Usage: 'debug <command> [arguments]'`
        });

    return ctx.reply({ embeds: [embed] });
};
