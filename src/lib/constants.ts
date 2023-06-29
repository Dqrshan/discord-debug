import { SlashCommandBuilder } from 'discord.js';

export const debugCommand = new SlashCommandBuilder()
    .setName('debug')
    .setDescription('Debugging tool for this bot')
    .addSubcommand((sub) =>
        sub.setName('info').setDescription('[Default] Main debug information')
    )
    .addSubcommand((sub) =>
        sub.setName('stats').setDescription('Returns the machine\'s statistics for this instance.')
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
                    .setDescription('Path to the file')
                    .setRequired(true)
            )
    );
