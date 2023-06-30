import { ChatInputCommandInteraction, EmbedBuilder, Message } from 'discord.js';
import type { Debugger } from '..';
import { Command } from '../lib/Command';
import { warnEmbed } from '../lib';

const command: Command = {
    name: 'owners',
    description: 'Manage owners of the bot',
    messageRun: async (message, parent, args) => {
        await owners(message, parent, args);
    },
    interactionRun: async (interaction, parent) => {
        await owners(
            interaction,
            parent,
            interaction.options.getSubcommand(true)
        );
    }
};

export default command;

const owners = async (
    message: Message | ChatInputCommandInteraction,
    parent: Debugger,
    args: string
) => {
    if (!args || args.split(' ')[0] === 'list') {
        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Client Owners`)
                    .setDescription(
                        parent.owners
                            .map((id, i) => `${i + 1}. \`${id}\`: <@${id}>`)
                            .join('\n')
                    )
                    .setColor(parent.options!.themeColor!)
                    .setFields({
                        name: 'Information',
                        value: `- Use \`owners add [id]\` to add an owner\n- Use \`owners remove [id]\` to remove an owner`
                    })
            ]
        });
    }
    const id =
        message instanceof Message
            ? args.split(' ')[1]
            : message.options.getString('user_id', true);
    if (!id)
        return message.reply({
            embeds: [
                warnEmbed(
                    'Missing argument',
                    'Please provide a user id',
                    'ERROR'
                )
            ]
        });

    switch (args.split(' ')[0]) {
        case 'add':
            if (parent.owners.includes(id))
                return message.reply({
                    embeds: [
                        warnEmbed(
                            'Already added',
                            'This user is already an owner',
                            'WARN'
                        )
                    ]
                });
            parent.owners = parent.addOwner(id);
            message.reply({
                embeds: [
                    warnEmbed('Added', `Added \`${id}\` to owners`, 'SUCCESS')
                ]
            });
            break;
        case 'remove':
            if (!parent.owners.includes(id))
                return message.reply({
                    embeds: [
                        warnEmbed(
                            'Not found',
                            'This user is not an owner',
                            'WARN'
                        )
                    ]
                });
            parent.owners = parent.removeOwner(id);
            message.reply({
                embeds: [
                    warnEmbed(
                        'Removed',
                        `Removed \`${id}\` from owners`,
                        'SUCCESS'
                    )
                ]
            });
            break;
    }
};
