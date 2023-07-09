import { Client, GatewayIntentBits } from 'discord.js';
import { Debugger } from '../dist';

const { token, mysql } = require('./config');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const debug = new Debugger(client, {
    registerApplicationCommands: true,
    themeColor: '#ffea81',
    sqlConnectionOptions: {
        uri: mysql
    },
    loadDefaultListeners: {
        message: true,
        interaction: true
    },
    secrets: [token, mysql]
});

client.on('ready', () => console.log(`Logged in as ${client.user!.tag}`));

client.on('messageCreate', async (message) => {
    if (message.content === '!ping') {
        message.reply('pong!');
    } else if (message.content.startsWith('!debug')) {
        const args = message.content.split(' ').slice(1);
        await debug.messageRun(message, args);
    }
});

client.login(token);
