import { ChatInputCommandInteraction, Message, EmbedBuilder } from 'discord.js';
import { Command, commands } from '../lib/Command';
import { capitalize } from '../lib';
import { Debugger } from '..';

const command: Command = {
    name: 'help',
    aliases: ['h'],
    description: 'List of all debug commands',
    messageRun: async (message, parent, args) => {
        await help(message, args, parent);
    },
    interactionRun: async (interaction, parent) => {
        const cmd = interaction.options.getString('command', false);
        await help(interaction, cmd, parent);
    }
};

export default command;

const help = async (
    ctx: Message | ChatInputCommandInteraction,
    cmd: string | null,
    parent: Debugger
) => {
    if (
        cmd &&
        (commands.some((c) => c.name === cmd.toLowerCase()) ||
            commands.some((c) => c.aliases?.includes(cmd.toLowerCase())))
    ) {
        const command =
            commands.get(cmd.toLowerCase()) ||
            commands.find(
                (c) => c.aliases && c.aliases.includes(cmd.toLowerCase())
            );
        const embed = new EmbedBuilder()
            .setTitle(`${capitalize(command?.name!)}`)
            .setURL(
                `https://lxrnz.gitbook.io/discord-debug/commands/${command?.name}`
            )
            .setColor(parent.options!.themeColor!)
            .setFields(
                {
                    name: 'Details',
                    value: command?.description ?? 'None',
                    inline: true
                },
                {
                    name: 'Aliases',
                    value:
                        command?.aliases?.map((a) => `\`${a}\``).join(', ') ??
                        'None',
                    inline: true
                }
            )
            .setFooter({
                text: `discord-debug v${
                    require('../../package.json').version
                } | Use 'help' for a list of commands`
            });

        return ctx.reply({ embeds: [embed] });
    }
    const embed = new EmbedBuilder()
        .setTitle(`Available Commands (${commands.size})`)
        .setDescription(
            commands.map((c) => `\`${capitalize(c.name)}\``).join(', ')
        )
        .setColor(parent.options!.themeColor!)
        .setThumbnail(ctx.client.user.displayAvatarURL())
        .setFooter({
            text: `discord-debug v${
                require('../../package.json').version
            } | Use 'help [command]' for detailed information`
        });

    return ctx.reply({ embeds: [embed] });
};
