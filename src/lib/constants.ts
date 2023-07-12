import { SlashCommandBuilder } from 'discord.js';

export const commands = {
    info: {
        name: 'info',
        description: '[Default] Main debug information',
        aliases: []
    },
    stats: {
        name: 'stats',
        description: "Returns the machine's statistics for this instance.",
        aliases: ['statistics']
    },
    help: {
        name: 'help',
        description: 'List of all debug commands',
        aliases: ['h']
    },
    curl: {
        name: 'curl',
        description: 'Curl hyper links',
        aliases: []
    },
    docs: {
        name: 'docs',
        description: 'Searches the discord.js documentation',
        aliases: []
    },
    eval: {
        name: 'eval',
        description: 'Evaluates a javascript code',
        aliases: ['javascript', 'js', 'ev']
    },
    owners: {
        name: 'owners',
        description: 'Manage owners of the bot',
        aliases: []
    },
    shard: {
        name: 'shard',
        description: 'Evaluates a javascript code on all shards',
        aliases: []
    },
    shell: {
        name: 'shell',
        description: 'Executes a shell command',
        aliases: ['sh', 'exec', 'bash']
    },
    source: {
        name: 'source',
        description: 'Shows the source code of a file',
        aliases: ['src', 'file', 'cat']
    },
    sql: {
        name: 'sql',
        description: 'Executes a SQL query',
        aliases: ['query']
    },
    type: {
        name: 'type',
        description: 'Returns type of evaluated javascript code',
        aliases: ['jsi', 'jsinfo']
    }
};

export const applicationCommand = new SlashCommandBuilder()
    .setName('debug')
    .setDescription('Debugging tool for this bot')
    .addSubcommand((sub) =>
        sub.setName('info').setDescription('[Default] Main debug information')
    )
    .addSubcommand((sub) =>
        sub
            .setName('stats')
            .setDescription(
                "Returns the machine's statistics for this instance."
            )
    )
    .addSubcommand((sub) =>
        sub
            .setName('help')
            .setDescription('List of all debug commands')
            .addStringOption((op) =>
                op
                    .setName('command')
                    .setDescription('Command to get help for')
                    .setRequired(false)
                    .setAutocomplete(true)
            )
    )
    .addSubcommand((sub) =>
        sub
            .setName('curl')
            .setDescription('Curl hyper links')
            .addStringOption((op) =>
                op
                    .setName('url')
                    .setDescription('URL to curl')
                    .setRequired(true)
            )
    )
    .addSubcommand((sub) =>
        sub
            .setName('eval')
            .setDescription('Evaluates a javascript code')
            .addStringOption((op) =>
                op
                    .setName('code')
                    .setDescription('Code to evaluate')
                    .setRequired(true)
            )
    )
    .addSubcommand((sub) =>
        sub
            .setName('docs')
            .setDescription('Searches the discord.js documentation')
            .addStringOption((op) =>
                op
                    .setName('query')
                    .setDescription('Query to search for')
                    .setRequired(true)
                    .setAutocomplete(true)
            )
    )
    .addSubcommand((sub) =>
        sub
            .setName('type')
            .setDescription('Returns type of evaluated javascript code')
            .addStringOption((op) =>
                op
                    .setName('code')
                    .setDescription('Code to evaluate')
                    .setRequired(true)
            )
    )
    .addSubcommandGroup((group) =>
        group
            .setName('owners')
            .setDescription('Manage owners of the bot')
            .addSubcommand((sub) =>
                sub
                    .setName('add')
                    .setDescription('Add an owner')
                    .addStringOption((op) =>
                        op
                            .setName('user_id')
                            .setDescription('User ID to add')
                            .setRequired(true)
                    )
            )
            .addSubcommand((sub) =>
                sub
                    .setName('remove')
                    .setDescription('remove an owner')
                    .addStringOption((op) =>
                        op
                            .setName('user_id')
                            .setDescription('User ID to remove')
                            .setRequired(true)
                    )
            )
            .addSubcommand((sub) =>
                sub.setName('list').setDescription('List all owners')
            )
    )
    .addSubcommand((sub) =>
        sub
            .setName('shard')
            .setDescription('Evaluates a javascript code on all shards')
            .addStringOption((op) =>
                op
                    .setName('code')
                    .setDescription('Code to evaluate')
                    .setRequired(true)
            )
    )
    .addSubcommand((sub) =>
        sub
            .setName('shell')
            .setDescription('Executes a shell command')
            .addStringOption((op) =>
                op
                    .setName('command')
                    .setDescription('Command to execute')
                    .setRequired(true)
            )
    )
    .addSubcommand((sub) =>
        sub
            .setName('source')
            .setDescription('Shows the source code of a file')
            .addStringOption((op) =>
                op
                    .setName('path')
                    .setDescription('Path to the file OR folder')
                    .setRequired(false)
            )
    )
    .addSubcommand((sub) =>
        sub
            .setName('sql')
            .setDescription('Executes a SQL query')
            .addStringOption((op) =>
                op
                    .setName('query')
                    .setDescription('SQL args to execute')
                    .setRequired(true)
            )
    );
