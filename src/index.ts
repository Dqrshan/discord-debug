import { ChatInputCommandInteraction, Client, Message, User } from "discord.js";

export interface DebuggerOptions {
    owners?: string[];
    secrets?: any[];
    applicationCommands?: {
        name: string;
        register: boolean | false;
    };
}

export type Context = ChatInputCommandInteraction | Message;

class DebuggerClient {
    public owners: string[];
    public constructor(public client: Client, public options: DebuggerOptions) {
        if (!(client instanceof Client)) {
            throw new TypeError("`client` must be a Discord.js Client");
        }

        this.owners = options.owners ?? [];
        if (!this.options.secrets || !Array.isArray(this.options.secrets))
            this.options.secrets = [];

        client.once("ready", (client) => {
            if (!this.owners.length) {
                console.warn(
                    "Debugger: No owners were provided, fetching from client application.."
                );
                client.application.fetch().then((app) => {
                    if (!app.owner)
                        throw new Error(
                            "Debugger: Failed to fetch application owner"
                        );
                    if (app.owner instanceof User)
                        return this.owners.push(app.owner.id);

                    this.owners = app.owner.members.map((member) => member.id);
                    console.info(
                        `Debugger: Fetched ${this.owners.length} owner(s): ${
                            this.owners.length > 3
                                ? this.owners.slice(0, 2).join(", ") +
                                  ` and ${this.owners.length - 3} more.`
                                : this.owners.join(", ")
                        }`
                    );
                });
            }
        });
    }

    public async run(message: Message, args: string[]) {
        if (!this.owners.includes(message.author.id)) return;
    }
}

export { DebuggerClient };
