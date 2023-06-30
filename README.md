<div align="center">
    <h1>Discord.js Debugging Tool</h1>
    <p>A simple, customizable and efficient discord.js bot debugging tool</p>
    <a href="https://nodei.co/npm/discord-debug/">
        <img src="https://nodei.co/npm/discord-debug.png?compact=true">
    </a>
    <div>
        <img src="https://img.shields.io/npm/v/discord-debug?style=for-the-badge&color=00bb88">
        <img src="https://img.shields.io/npm/dw/discord-debug?style=for-the-badge&color=6666ff">
        <img src="https://img.shields.io/npm/l/discord-debug?style=for-the-badge&color=ff6666">
    </div>
</div>

## Installation

**NOTE**: `discord-debug` only supports [discord.js v14](https://www.npmjs.com/package/discord.js/v/14.11.0 'djs v14').
**Node.js 16.9.0** or newer is required

```bash
npm i discord-debug@latest
```

---

## Quick Links

-   [Documentation](https://lxrnz.gitbook.io/discord-debug/ 'Documentation')
-   [Discord](https://dsc.gg/lorenz/ 'Discord')
-   [Features](https://lxrnz.gitbook.io/discord-debug/commands/info)
-   [Examples](https://github.com/Dqrshan/discord-debug/tree/master/examples)

## Basic Usage

```js
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
    // theme color of the client used in all embeds (default: #000000)
    themeColor: '#00ffff',
    // secrets to hide during eval (default: client token)
    secrets: [],
    // owners that can use this tool (default: client application owner(s))
    owners: [],
    // integrate slash commands [/debug] (default: false)
    registerApplicationCommands: true,
    // load default event listeners [messageCreate, interactionCreate] (default: *see below*)
    loadDefaultListeners: {
        message: true,
        interaction: true
    },
    // MySQL connection options for sql command (default: {})
    sqlConnectionOptions: {
        uri: 'mysql://root:password@localhost:3306/database'
    }
});

client.on('ready', () => console.log(`Logged in as ${client.user.tag}`));

client.on('messageCreate', async (message) => {
    if (message.content === '!ping') {
        return message.reply('pong!');
    } else if (message.content.startsWith('!debug')) {
        // handle *in* prefix commands!
        const args = message.content.split(' ').slice(1);
        await debug.messageRun(message, args);
    }
});

client.login('token');
```

---

## Debug Commands

![help](assets/help.png)

> `discord-debug` comes with an exported **`commands`** collection of all commands.

```js
const { EmbedBuilder } = require('discord.js');
const { Commands } = require('discord-debug');

const helpEmbed = new EmbedBuilder().setTitle('Help').setFields(
    Commands.map((data, name) => {
        return {
            name,
            value: `${data.description}\n${data.aliases.join(', ') ?? ''}`,
            inline: true
        };
    })
);
```

---

## Features

-   View features in the [documentation](https://lxrnz.gitbook.io/discord-debug/commands/info 'Features')

---

## Notes

-   This repository is inspired by [wonderlandpark/dokdo](https://github.com/wonderlandpark/dokdo).
-   This repository will receive its own features, may it be in dokdo or not.

---

## Contributing

**NOTE**: Create an [issue](https://github.com/Dqrshan/discord-debug/issues 'discord-debug/issues') before creating a pull request!

1. [Fork](https://github.com/Dqrshan/discord-debug/fork 'discord-debug/fork') this repository.
2. Create a [PR](https://github.com/Dqrshan/discord-debug/pulls 'discord-debug/pulls').

---

## Developer Contact

-   [https://darshan.studio/](https://darshan.studio/ 'Darshan')

---

#### Thanks for using `discord-debug` 💓
