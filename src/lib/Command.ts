import {
    ChatInputCommandInteraction,
    Collection,
    Message,
    SlashCommandBuilder
} from 'discord.js';
import { Debugger } from '..';
import { readdirSync } from 'node:fs';

export interface Command {
    name: string;
    description: string;
    aliases?: string[];
    applicationCommand?:
        | SlashCommandBuilder
        | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
    messageRun?: (
        msg: Message,
        parent: Debugger,
        args: string
    ) => Promise<unknown>;
    interactionRun?: (
        interaction: ChatInputCommandInteraction,
        parent: Debugger
    ) => Promise<unknown>;
}

const Commands = new Collection<string, Command>();

export const loadCommands = async () => {
    const files = readdirSync(__dirname.replace('lib', 'commands')).filter(
        (f) => f.endsWith('.js') && f.split('.')[0] !== 'index'
    );
    for (const file of files) {
        const { default: command } = await import(`../commands/${file}`);
        if (!command || !command.name) continue;
        Commands.set(command.name, command);
    }
};

export { Commands };
