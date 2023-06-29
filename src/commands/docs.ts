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
import { Doc, DocElement, DocTypes } from 'discordjs-docs-parser';

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
        if (!args) return message.reply('Please provide a query.');
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

    const docType = element.docType;

    return isMsg
        ? interaction.reply({
              embeds: [
                  new EmbedBuilder()
                      .setColor(parent.options!.themeColor!)
                      .setDescription(
                          `### ${docTypeEmoji(docType)} ${resolveElementString(
                              element,
                              doc
                          )}`
                      )
              ]
          })
        : await interaction.editReply({
              content: `### ${docTypeEmoji(docType)} ${resolveElementString(
                  element,
                  doc
              )}`
          });
};

function resolveElementString(element: DocElement, doc: Doc): string {
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

    return `${parts.join('')}\n${description}`;
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
