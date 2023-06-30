import {
    ChatInputCommandInteraction,
    hideLinkEmbed,
    hyperlink,
    underscore,
    bold,
    Message,
    EmbedBuilder
} from 'discord.js';
import { Command } from '../lib/Command';
import { Debugger } from '..';
import {
    Doc,
    DocClass,
    DocElement,
    DocFunction,
    DocTypes
} from 'discordjs-docs-parser';
import { codeBlock, warnEmbed } from '../lib';

const command: Command = {
    name: 'docs',
    description: 'Searches the discord.js documentation',
    interactionRun: async (interaction, parent) => {
        await interaction.deferReply({
            fetchReply: true
        });

        const args = interaction.options.getString('query', true);
        await docs(interaction, parent, args);
    },
    messageRun: async (message, parent, args) => {
        if (!args)
            return message.reply({
                embeds: [
                    warnEmbed(
                        'Missing argument',
                        'Please provide a query',
                        'ERROR'
                    )
                ]
            });
        await docs(message, parent, args);
    }
};

export default command;

const docs = async (
    interaction: Message | ChatInputCommandInteraction,
    parent: Debugger,
    args: string
) => {
    const isMsg = interaction instanceof Message;
    const doc = await Doc.fetch('main', { force: true });

    const element = doc.get(...args.split(/\.|#/));
    if (!element) {
        isMsg
            ? interaction.reply('No results found.')
            : await interaction.editReply({
                  content: 'No results found.'
              });
        return;
    }

    const embed = resolveElementEmbed(element, doc).setColor(
        parent.options?.themeColor!
    );

    return isMsg
        ? interaction.reply({
              embeds: [embed]
          })
        : await interaction.editReply({
              embeds: [embed]
          });
};

function resolveElementEmbed(element: DocElement, doc: Doc): EmbedBuilder {
    const parts = [];
    if (element.docType === 'event') parts.push(`${bold('(event)')} `);
    if (element.static) parts.push(`${bold('(static)')} `);
    parts.push(underscore(bold(element.link)));
    if (element.extends)
        parts.push(formatInheritance('extends', element.extends, doc));
    if (element.access === 'private') parts.push(` ${bold('PRIVATE')}`);
    if (element.deprecated) parts.push(` ${bold('DEPRECATED')}`);

    const s = (
        (element.formattedDescription || element.description) ??
        ''
    ).split('\n');
    const description =
        s.length > 1
            ? `${s[0]} ${hyperlink(
                  '(more...)',
                  hideLinkEmbed(element.url ?? '')
              )}`
            : s[0];
    const em = new EmbedBuilder().setDescription(
        `### ${docTypeEmoji(element.docType)} ${parts.join('')}\n${description}`
    );

    if (element instanceof DocClass && element.construct) {
        em.addFields({
            name: 'Constructor',
            value: codeBlock.construct(
                `new ${element.construct.name}${
                    element.construct.params
                        ? `(${element.construct.params
                              .map((d) => `${d.name}${d.optional ? '?' : ''}`)
                              .join(', ')})`
                        : '()'
                }`,
                'ts'
            ),
            inline: false
        });
    }
    if (element instanceof DocFunction && element.params) {
        em.addFields({
            name: 'Usage',
            value: `${codeBlock.construct(
                `${element.name}(${element.params
                    .map(
                        (p) =>
                            `${p.name}${p.optional ? '?' : ''}${
                                p.type ? ': ' + p.type.join(', ') : ''
                            }`
                    )
                    .join(', ')})`,
                'ts'
            )}`,
            inline: false
        });
    }

    if (element.meta) {
        em.addFields({
            name: 'Defined in',
            value: hyperlink(
                `${element.meta.file}:${element.meta.line}`,
                hideLinkEmbed(
                    `https://github.com/discordjs/discord.js/blob/main/${element.meta.path}/${element.meta.file}#L${element.meta.line}`
                )
            ),
            inline: true
        });
    }

    return em;
}

function extractGenericTypeInfill(type: string): string {
    const match = /<(?<type>[A-Za-z]+)>/.exec(type);
    return match?.groups?.type ? match.groups.type : type;
}

function formatInheritance(
    prefix: string,
    inherits: string[][],
    doc: Doc
): string {
    const res = inherits.flatMap((element) => {
        if (Array.isArray(element)) return element.flat(5);
        return [element];
    });

    const inheritedLinks = res
        .map((element) => doc.get(extractGenericTypeInfill(element))?.link)
        .filter(Boolean);

    if (!inheritedLinks.length) return '';

    return ` (${prefix} ${inheritedLinks.join(' and ')})`;
}

const docTypeEmoji = (docType: DocTypes | null) => {
    switch (docType) {
        case DocTypes.Class:
            return '🧩';
        case DocTypes.Typedef:
        case DocTypes.Interface:
            return '📝';
        case DocTypes.Method:
        case DocTypes.Function:
            return '📦';
        case DocTypes.Prop:
            return '🔧';
        case DocTypes.Event:
            return '📡';
        default:
            return '🛠️';
    }
};
