---
description: A simple discord.js debugging tool
cover: >-
  https://images.unsplash.com/photo-1579546929518-9e396f3cc809?crop=entropy&cs=srgb&fm=jpg&ixid=M3wxOTcwMjR8MHwxfHNlYXJjaHwxfHxncmFkaWVudHxlbnwwfHx8fDE2ODc2ODk2MDN8MA&ixlib=rb-4.0.3&q=85
coverY: 0
---

# discord-debug

{% hint style="info" %}
Latest: `v2.0.5` <mark style="color:green;">**\[Stable]**</mark>
{% endhint %}

## Installation

{% code fullWidth="false" %}
```bash
npm i discord-debug@latest
```
{% endcode %}

## Example Usage

```typescript
const { Client, GatewayIntentBits } = require('discord.js');
const { Debugger } = require('discord-debug');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ]
});

const debug = new Debugger(client, {
    secrets: [process.env.WEBHOOK],
    owners: ['838620835282812969'],
    registerApplicationCommands: true
});

client.on('ready', () => console.log(`Logged in as ${client.user.tag}`));

client.on('messageCreate', async (message) => {
    if (message.content === '!ping') {
        return message.reply('pong!');
    } else if (message.content.startsWith('!debug')) {
        const args = message.content.split(' ').slice(1);
        await debug.messageRun(message, args); // handle debugger commands
    }
});

client.login('token');
```
