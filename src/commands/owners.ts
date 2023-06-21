import { EmbedBuilder, Message } from 'discord.js';
import type { Debugger } from '..';

export async function owners(message: Message, parent: Debugger, args: string) {
    if (!args) {
        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(`Client Owners`)
                    .setDescription(
                        parent.owners
                            .map((id, i) => `${i + 1}. \`${id}\`: <@${id}>`)
                            .join('\n')
                    )
                    .setFields({
                        name: 'Information',
                        value: `- Use \`owners add [id]\` to add an owner\n- Use \`owners remove [id]\` to remove an owner`
                    })
            ]
        });
    }

    const sub = args.split(' ')[0];
    const id = args.split(' ')[1];

    if (!sub || !id) return message.reply(`Missing Arguments.`);

    switch (sub) {
        case 'add':
            if (parent.owners.includes(id))
                return message.reply(`Already added.`);
            parent.owners = parent.addOwner(id);
            message.reply(`Added \`${id}\`.`);
            break;
        case 'remove':
            if (!parent.owners.includes(id)) return message.reply(`Not added.`);
            parent.owners = parent.removeOwner(id);
            message.reply(`Removed \`${id}\`.`);
            break;
    }
}
