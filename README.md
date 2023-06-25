# Discord.js Debugging Tool

> Inspired by [wonderlandpark/dokdo](https://github.com/wonderlandpark/dokdo), `discord-debug` is efficient, customizable, simple and consistent!

> All credits go to [wonderlandpark/dokdo](https://github.com/wonderlandpark/dokdo)

---

## Installation

```bash
npm i discord-debug@latest
```

-   Core Dependencies
    > ```bash
    > npm i discord.js colorette
    > ```

---

## Documentation

-   https://lxrnz.gitbook.io/discord-debug/

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
    /* secrets to hide during eval (default: client token) */
    secrets: [],
    /* owners that can use this tool (default: client application owner(s)) */
    owners: [],
    /* integrate slash commands [/debug] (default: false) */
    registerApplicationCommands: true
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
const { commands } = require('discord-debug');

const helpEmbed = new EmbedBuilder().setTitle('Help').setFields(
    commands.map((data, name) => {
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

-   View features in the [documentation](https://lxrnz.gitbook.io/discord-debug/commands/default-info)

---

## Notes

-   This repository is inspired by [wonderlandpark/dokdo](https://github.com/wonderlandpark/dokdo). All credits goes to dokdo.
-   Please make sure to star dokdo before you star this repository!

-   This repository will receive its own features, may it be in dokdo or not.

---

## Contributing

**NOTE**: Create an [issue](https://github.com/Dqrshan/discord-debug/issues) before creating a pull request!

1. [Fork](https://github.com/Dqrshan/discord-debug/fork) this repository.
2. Create a [PR](https://github.com/Dqrshan/discord-debug/pulls).

---

## Developer Contact

-   https://darshan.studio/

---

#### Thanks for using `discord-debug` 💓
