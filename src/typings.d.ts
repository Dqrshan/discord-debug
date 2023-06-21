import { Client, Collection, Snowflake } from 'discord.js';
import { Commands } from './commands';

export interface Options {
    owners?: Snowflake[];
    secrets?: any[];
}

declare module 'discord-debug' {
    export interface Debugger {}

    export const commands: Collection<CommandName, CommandData>;
}

export type CommandName = (typeof Commands)[number];
export type CommandData = {
    aliases: string[];
    description: string;
};
