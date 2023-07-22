/**
 * @example
 * @info This file shows you how you can create your own commands collection inferred from the discord-debug commands collection.
 *
 * @info
 * In this file, we will NOT BE using a command handler, as this is just an example.
 * I recommend checking my other repository below for a complete framework.
 * @link https://github.com/Dqrshan/Bot-Framework
 */

// importing required dependencies
import { Debugger, Commands } from '../../dist'; // replace with 'discord-debug' in your projects
import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { Command } from '../../dist/lib/Command'; // replace with 'discord-debug/lib/Command' in your projects

// custom commands collection declaration
declare module 'discord.js' {
    interface Client {
        commands: Collection<string, Command>;
    }
}

// initializing discord.js client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// initializing discord-debug client
const debug = new Debugger(client);

// registering our own commands collection
client.commands = new Collection();
Commands.forEach((command) => {
    /**
     * @info
     * Leaving the editing part up to you!
     * HINT: change command name, command description, aliases, etc.
     */
    client.commands.set(command.name, command);
});

// lets check if the bot is ready.
client.once('ready', () => {
    console.log('Ready!');
});

// executing commands
client.on('messageCreate', async (message) => {
    const args = message.content.split(' ');
    const cmd = args.shift()?.toLowerCase();
    if (!cmd) return;

    const command =
        client.commands.get(cmd) ||
        client.commands.find((c) => c.aliases && c.aliases.includes(cmd));
    if (!command || !command.messageRun) return;

    await command
        .messageRun(message, debug, args.join(' '))
        .catch(console.error);
});

client.login('token');
// DONE!!
