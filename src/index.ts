import {
    Client,
    Message,
    type Snowflake,
    Team,
    ChatInputCommandInteraction,
    REST,
    Routes
} from 'discord.js';
import {
    yellowBright,
    redBright,
    greenBright,
    blueBright,
    bold,
    italic,
    whiteBright
} from 'colorette';
import fs from 'fs';
import { commands, loadCommands } from './lib/Command';
import { debugCommand } from './lib/constants';
import fetch from 'node-fetch';

const { version, name } = require('../package.json');

fetch(`https://registry.npmjs.org/${name}/`).then((res) => {
    res.json().then((json) => {
        if (json['dist-tags'].latest !== version) {
            console.log(
                `┌────────────────────────────┐
│         ${bold(yellowBright('NEW UPDATE'))}         │
├────────────────────────────┤
│      v${redBright(version)} -> v${greenBright(
                    json['dist-tags'].latest
                )}      │
│ ${italic(whiteBright(`npm i ${name}@latest`))} │
└────────────────────────────┘`
            );
        }
    });
});

class Debugger {
    public owners: Snowflake[];
    /**
     * Main Debugger Client
     * @param client Discord Client
     * @param options Debugger options
     */
    public constructor(public client: Client, public options?: Options) {
        fs.readFileSync('debug.config', { flag: 'a+' });
        if (!(client instanceof Client))
            throw new TypeError(
                '`client` must be a Discord.js Client instance.'
            );

        if (options?.secrets && !Array.isArray(options.secrets))
            options.secrets = [];
        this.owners = options?.owners ?? this._syncOwners();
        client.once('ready', async (core) => {
            await loadCommands(this);
            if (options?.registerApplicationCommands) {
                const rest = new REST().setToken(core.token);
                (async () => {
                    try {
                        this.log(
                            `Started refreshing application (/) commands.`,
                            'info'
                        );

                        const data = (await rest.put(
                            Routes.applicationCommands(core.user.id),
                            { body: [debugCommand.toJSON()] }
                        )) as any;

                        this.log(
                            `Successfully reloaded ${data.length} application (/) commands.`,
                            'info'
                        );
                    } catch (error) {
                        this.log(error as string, 'error');
                    }
                })();
            }
            if (!this.owners.length) {
                this.log(
                    'No owners were provided, fetching from application...',
                    'warn'
                );
                core.application?.fetch().then((app) => {
                    if (!app?.owner)
                        return this.log(
                            'Application owner could not be fetched.',
                            'error'
                        );

                    if (app.owner instanceof Team)
                        this.owners = app.owner.members
                            .filter((m) => !this.owners.includes(m.id))
                            .map((m) => m.id);
                    else
                        this.owners = this.owners.includes(app.owner.id)
                            ? this.owners
                            : [app.owner.id];
                    this.log(
                        `Fetched ${this.owners.length} owner${
                            this.owners.length > 1 ? 's' : ''
                        } from application, ${
                            this.owners.length
                        } existing owners.`,
                        'info'
                    );
                    this.owners.forEach((id) => this.addOwner(id));
                });
            } else {
                this.owners.forEach((id) => this.addOwner(id));
            }
            this.log(`Debug owners: ${this.owners.join(', ')}`, 'debug');
        });

        client.on('interactionCreate', async (interaction) => {
            if (!options?.registerApplicationCommands) return;
            if (!(interaction instanceof ChatInputCommandInteraction)) return;
            if (!this.owners.includes(interaction.user.id)) {
                const content =
                    'This command can only be used by the owners of the bot.';
                interaction.deferred
                    ? await interaction.editReply({
                          content
                      })
                    : interaction.reply({
                          content,
                          ephemeral: true
                      });
                return;
            }
            if (!interaction.isCommand()) return;
            if (!this.options?.registerApplicationCommands) return;
            const command = interaction.options.getSubcommandGroup()
                ? commands.get(interaction.options.getSubcommandGroup()!)
                : commands.get(interaction.options.getSubcommand()!);
            if (!command) return;
            if (command.interactionRun) {
                await command
                    .interactionRun(
                        interaction as ChatInputCommandInteraction,
                        this
                    )
                    .catch((err) => this.log(err, 'error'));
            }
        });
    }
    public async messageRun(message: Message, args: string[]) {
        if (!(message instanceof Message))
            throw new TypeError(
                '`message` must be a Discord.js Message instance.'
            );

        if (!this.owners.includes(message.author.id)) return;
        const cx = args.shift()!;
        if (!cx) return commands.get('info')?.messageRun!(message, this, '');
        const command =
            commands.get(cx) ||
            commands.find((c) => c.aliases && c.aliases.includes(cx));
        if (!command) return;
        if (command.messageRun) {
            await command
                .messageRun(message, this, args.join(' '))
                .catch((err) => this.log(err, 'error'));
        }

        return message;
    }

    private _syncOwners() {
        const owners: Snowflake[] = [];
        fs.readFile('debug.config', (err, data) => {
            if (err) {
                this.log(`Cannot sync owners: ${err.message!}`, 'error');
            } else {
                let stored =
                    data && data.toString() && data.toString().length
                        ? JSON.parse(data.toString())
                        : { owners: [] };
                stored.owners
                    .filter((o: any) => !this.owners.includes(o))
                    .forEach((o: any) => owners.push(o));
            }
        });
        return owners;
    }

    public addOwner(id: Snowflake) {
        const owners: Snowflake[] = [];
        fs.readFile('debug.config', (err, data) => {
            if (err) {
                this.log(
                    `An error occurred while adding owner: ${err.message}`,
                    'error'
                );
                return null;
            } else {
                let stored =
                    data && data.toString() && data.toString().length
                        ? JSON.parse(data.toString())
                        : { owners: [] };

                if (stored.owners.includes(id)) return 'Already an owner.';
                stored.owners.push(id);
                fs.writeFile('debug.config', JSON.stringify(stored), () => {});
                stored.owners
                    .filter((o: any) => !this.owners.includes(o))
                    .forEach((o: any) => owners.push(o));
            }
        });
        return owners;
    }

    public removeOwner(id: Snowflake) {
        const owners: Snowflake[] = [];
        fs.readFile('debug.config', (err, data) => {
            if (err) {
                this.log(
                    `An error occurred while removing owner: ${err.message}`,
                    'error'
                );
                return null;
            } else {
                let stored =
                    data && data.toString() && data.toString().length
                        ? JSON.parse(data.toString())
                        : { owners: [] };

                if (!stored.owners.includes(id)) return 'Not an owner.';
                stored.owners.splice(stored.owners.indexOf(id), 1);
                fs.writeFile('debug.config', JSON.stringify(stored), () => {});
                stored.owners
                    .filter((o: any) => !this.owners.includes(o))
                    .forEach((o: any) => owners.push(o));
            }
        });
        return owners;
    }

    public log(message: string, type: 'error' | 'warn' | 'info' | 'debug') {
        const pad = ' '.repeat(2);
        if (type === 'error')
            console.error(`${redBright('[Debugger: ERROR]')}${pad} ${message}`);
        else if (type === 'warn')
            console.warn(
                `${yellowBright('[Debugger:  WARN]')}${pad} ${message}`
            );
        else if (type === 'info')
            console.info(
                `${greenBright('[Debugger:  INFO]')}${pad} ${message}`
            );
        else if (type === 'debug')
            console.debug(
                `${blueBright('[Debugger: DEBUG]')}${pad} ${message}`
            );
    }
}

export { Debugger, commands };
export interface Options {
    owners?: Snowflake[];
    secrets?: any[];
    registerApplicationCommands?: boolean | false;
}
