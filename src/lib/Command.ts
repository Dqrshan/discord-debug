import {
    ChatInputCommandInteraction,
    Collection,
    Message,
    SlashCommandBuilder
} from 'discord.js';
import { Debugger } from '..';
import { readdirSync } from 'fs';

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

const commands = new Collection<string, Command>();

export const loadCommands = async (parent: Debugger) => {
    const files = readdirSync('dist/commands').filter(
        (f) => f.endsWith('.js') && f.split('.')[0] !== 'index'
    );
    for (const file of files) {
        const { default: command } = await import(`../commands/${file}`);
        if (!command || !command.name) continue;
        commands.set(command.name, command);
    }

    parent.log(`Loaded ${commands.size} commands`, 'info');
};

export { commands };
