import {
    Client,
    Message,
    type Snowflake,
    Team,
    EmbedBuilder
} from 'discord.js';
import { yellowBright, redBright, greenBright, blueBright } from 'colorette';
import commands, {
    curl,
    js,
    jsi,
    main,
    owners,
    shard,
    shell,
    source
} from './commands';
import fs from 'fs';
import { Options } from './typings';

class Debugger {
    public owners: Snowflake[];
    /**
     * Main Debugger Client
     * @param client Discord Client
     * @param options Debugger options
     */
    public constructor(public client: Client, public options?: Options) {
        fs.readFileSync('debug.config', { flag: 'a+' });
        this.owners = options?.owners ?? this._syncOwners();
        if (!(client instanceof Client))
            throw new TypeError(
                '`client` must be a Discord.js Client instance.'
            );

        if (options?.secrets && !Array.isArray(options.secrets))
            throw new TypeError('`secrets` must be an array.');

        client.once('ready', (core) => {
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
        });
    }

    public async run(message: Message, args: string[]) {
        if (!(message instanceof Message))
            throw new TypeError(
                '`message` must be a Discord.js Message instance.'
            );

        if (!this.owners.includes(message.author.id)) return;
        const subCommand = args.shift();

        if (!args.length && !subCommand) {
            return main(message, this);
        } else {
            switch (subCommand) {
                case 'curl':
                    curl(message, this, args.join(' '));
                    break;
                case 'js':
                case 'javascript':
                case 'eval':
                    js(message, this, args.join(' '));
                    break;
                case 'jsi':
                case 'type':
                    jsi(message, this, args.join(' '));
                    break;
                case 'owners':
                    owners(message, this, args.join(' '));
                    break;
                case 'shard':
                    shard(message, this, args.join(' '));
                    break;
                case 'shell':
                case 'exec':
                case 'sh':
                case 'bash':
                    shell(message, this, args.join(' '));
                    break;
                case 'source':
                case 'cat':
                case 'file':
                    source(message, this, args.join(' '));
                    break;
                case 'help':
                default:
                    message.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(
                                    `${this.client.user?.username}'s Debug Commands`
                                )
                                .setFields(
                                    commands.map((data, name) => ({
                                        name,
                                        value: `${data.description}${
                                            data.aliases.length
                                                ? `\n> *Aliases: ${data.aliases
                                                      .map((a) => `\`${a}\``)
                                                      .join(', ')}*`
                                                : ''
                                        }`,
                                        inline: true
                                    }))
                                )
                        ]
                    });
                    break;
            }
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

    private log(message: string, type: 'error' | 'warn' | 'info' | 'debug') {
        if (type === 'error')
            console.error(`${redBright('[Debugger: ERROR]')} ${message}`);
        else if (type === 'warn')
            console.warn(`${yellowBright('[Debugger: WARN]')} ${message}`);
        else if (type === 'info')
            console.info(`${greenBright('[Debugger: INFO]')} ${message}`);
        else if (type === 'debug')
            console.debug(`${blueBright('[Debugger: DEBUG]')} ${message}`);
    }
}

export { Debugger, commands };
