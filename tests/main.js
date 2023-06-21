const { Client, GatewayIntentBits } = require('discord.js');
const { Debugger } = require('../dist/src');

const { token } = require('./config');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

const debug = new Debugger(client, {
    secrets: [process.env.TEST]
    // owners: ['838285943365435453']
});

client.on('ready', () => console.log(`Logged in as ${client.user.tag}`));

client.on('messageCreate', async (message) => {
    if (message.content === '!ping') {
        return message.reply('pong!');
    } else if (message.content.startsWith('!debug')) {
        const args = message.content.split(' ').slice(1);
        await debug.run(message, args);
    }
});

client.login(token);
