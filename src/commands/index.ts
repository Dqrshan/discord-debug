import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { CommandData, CommandName } from '../typings';

export * from './curl';
export * from './js';
export * from './jsi';
export * from './main';
export * from './owners';
export * from './shard';
export * from './shell';
export * from './source';

const commands = new Collection<CommandName, CommandData>();

const cmds: Record<CommandName, CommandData> = {
    curl: {
        aliases: [],
        description: 'Curl hyper links'
    },
    js: {
        aliases: ['javascript', 'eval'],
        description: 'Evaluates a javascript code'
    },
    jsi: {
        aliases: ['type'],
        description: "Evaluates a javascript code and shows it's inspected type"
    },
    main: {
        aliases: [],
        description: 'Debug information of the bot'
    },
    owners: {
        aliases: [],
        description: 'Manages the owners of the bot'
    },
    shard: {
        aliases: [],
        description:
            'Evaluates a javascript code on all shards, and the current shard'
    },
    shell: {
        aliases: ['exec', 'sh', 'bash'],
        description: 'Executes a shell command'
    },
    source: {
        aliases: ['cat', 'file'],
        description: 'Shows the source code of a file'
    }
};

Object.keys(cmds).forEach((cmd) => {
    commands.set(cmd, cmds[cmd]);
});

export default commands;

export const Commands = readdirSync('src/commands')
    .filter((file) => file.endsWith('.ts') && file.split('.')[0] !== 'index')
    .map((f) => f.split('.')[0]);
