import Discord, {
    AttachmentBuilder,
    ChatInputCommandInteraction,
    Message
} from 'discord.js';
import type { Debugger } from '..';
import { Paginator, inspect, isInstance, isGenerator, warnEmbed } from '../lib';
import { Command } from '../lib/Command';

const command: Command = {
    name: 'eval',
    aliases: ['javascript', 'js'],
    description: 'Evaluates a javascript code',
    messageRun: async (message, parent, args) => {
        if (!args)
            return message.reply({
                embeds: [
                    warnEmbed(
                        'Missing argument',
                        'Please provide a code',
                        'ERROR'
                    )
                ]
            });
        await js(message, parent, args);
    },
    interactionRun: async (interaction, parent) => {
        if (!interaction.deferred)
            await interaction.deferReply({
                fetchReply: true
            });

        const args = interaction.options.getString('code', true);
        await js(interaction, parent, args);
    }
};

export default command;

const js = async (
    message: Message | ChatInputCommandInteraction,
    parent: Debugger,
    args: string
) => {
    // @ts-ignore
    const { client } = parent; // for eval
    const isMessage = message instanceof Message;

    const res = new Promise((resolve) =>
        resolve(
            args.includes('await') || args.includes('return')
                ? eval(`(async () => {\n${args}\n})()`)
                : eval(args)
        )
    ).catch((e) => e.toString());
    let typeOf;
    const result = await res
        .then(async (output) => {
            typeOf = typeof output;

            async function prettify(target: any) {
                if (
                    target instanceof Discord.Embed ||
                    target instanceof Discord.EmbedBuilder
                ) {
                    isMessage
                        ? await message.reply({ embeds: [target] })
                        : await message.editReply({
                              embeds: [target]
                          });
                } else if (isInstance(target, Discord.Attachment)) {
                    isMessage
                        ? await message.reply({
                              files:
                                  target instanceof Discord.Collection
                                      ? target.toJSON()
                                      : [target]
                          })
                        : await message.editReply({
                              files:
                                  target instanceof Discord.Collection
                                      ? target.toJSON()
                                      : [target]
                          });
                } else if (
                    typeof target === 'string' &&
                    /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/gi.test(target)
                ) {
                    isMessage
                        ? await message.reply({
                              files: [new AttachmentBuilder(target)]
                          })
                        : await message.editReply({
                              files: [new AttachmentBuilder(target)]
                          });
                }
            }

            if (isGenerator(output)) {
                for (const value of output as any) {
                    prettify(value);

                    if (typeof value === 'function') {
                        isMessage
                            ? await message.reply(value.toString())
                            : await message.editReply(value.toString());
                    } else if (typeof value === 'string')
                        isMessage
                            ? await message.reply(value)
                            : await message.editReply(value);
                    else {
                        isMessage
                            ? await message.reply(
                                  inspect(value, {
                                      depth: 1,
                                      maxArrayLength: 200
                                  })
                              )
                            : await message.editReply(
                                  inspect(value, {
                                      depth: 1,
                                      maxArrayLength: 200
                                  })
                              );
                    }
                }
            }

            prettify(output);

            if (typeof output === 'function') {
                typeOf = 'object';
                return output.toString();
            } else if (typeof output === 'string') {
                return output;
            }
            return inspect(output, { depth: 1, maxArrayLength: 200 });
        })
        .catch((e) => {
            typeOf = 'object';
            return e.toString();
        });

    const msg = new Paginator(message, result || '', parent, {
        lang: 'js',
        noCode: typeOf !== 'object'
    });
    await msg.init();
    await msg.addAction([
        {
            button: new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Danger)
                .setCustomId('debug$prev')
                .setLabel('Prev'),
            action: ({ manager }) => manager.previousPage(),
            requirePage: true
        },
        {
            button: new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Secondary)
                .setCustomId('debug$stop')
                .setLabel('Stop'),
            action: ({ manager }) => manager.destroy(),
            requirePage: true
        },
        {
            button: new Discord.ButtonBuilder()
                .setStyle(Discord.ButtonStyle.Success)
                .setCustomId('debug$next')
                .setLabel('Next'),
            action: ({ manager }) => manager.nextPage(),
            requirePage: true
        }
    ]);
};
