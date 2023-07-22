/**
 * @example
 * @info This file shows you how you can create your own application commands to use discord-debug.
 *
 * @info
 * In this file, we will NOT BE using a command handler, as this is just an example.
 * I recommend checking my other repository below for a complete framework.
 * @link https://github.com/Dqrshan/Bot-Framework
 */

// importing required dependencies
import { Debugger, Commands } from '../../dist'; // replace with 'discord-debug' in your projects
import {
    ChatInputCommandInteraction,
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder
} from 'discord.js';

// initializing discord.js client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

// initializing our rest instance
const rest = new REST({ version: '10' }).setToken('token'); // enter your bot token here.

// initializing discord-debug client
const debug = new Debugger(client, {
    // we don't need this, as we're registering our own commands
    registerApplicationCommands: false
});

// registering our own commands
const registerApplicationCommands = async () => {
    const debugCommand = new SlashCommandBuilder()
        .setName('debug')
        .setDescription('Debugging tool');
    // leaving this up to you! add your own commands here :)

    try {
        // register the command globally.
        rest.put(Routes.applicationCommands('client_id'), {
            body: [debugCommand.toJSON()]
        }).then((data: any) =>
            console.log(
                `Successfully registered ${data.length} application commands.`
            )
        );
    } catch (err) {
        // catch and log any errors!
        console.error(err);
    }
};

// lets check if the bot is ready.
client.once('ready', () => {
    console.log('Ready!');
});

// now we'll handle our commands
client.on('interactionCreate', async (interaction) => {
    if (
        !interaction.isCommand() ||
        !(interaction instanceof ChatInputCommandInteraction) // typescript
    )
        return; // ignore if not a command

    /**
     * @info note that we're using our discord-debug commands collection!
     */
    const command = Commands.get(interaction.commandName); // get the command

    // ignore if there's no command, or if there's no interactionRun function
    if (!command || !command.interactionRun) return;
    await command.interactionRun(interaction, debug).catch(console.error);
});

Promise.all([registerApplicationCommands()]).then(() => client.login('token'));
// DONE!!
