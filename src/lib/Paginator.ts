import Discord, {
    ButtonBuilder,
    ButtonInteraction,
    ComponentType,
    InteractionCollector,
    Message,
    type TextBasedChannel,
    User,
    ChatInputCommandInteraction
} from 'discord.js';
import { codeBlock, escapeRegex } from '.';
import type { Debugger } from '../';

export interface ProcessOptions {
    limit?: number;
    noCode?: boolean;
    secrets?: any[];
    lang?: string;
}

export interface ActionOptions {
    manager: Paginator;
    [x: string]: any;
}

export interface Action {
    button: ButtonBuilder;
    requirePage: boolean;

    action(options: ActionOptions): Promise<any> | any;
}

/**
 * Process Manager of every Process
 */
export class Paginator {
    public target: TextBasedChannel;
    public messageContent: string;
    public limit: number;
    public splitted: string[];
    public page: number;
    public author: User;
    public actions: Action[];
    public wait: number;
    public message?: Message;
    public argument: never[];
    public args: any;
    public messageComponentCollector:
        | InteractionCollector<ButtonInteraction>
        | undefined;

    constructor(
        public context: Message | ChatInputCommandInteraction,
        public content: string,
        public parent: Debugger,
        public options: ProcessOptions = {}
    ) {
        this.target = context.channel!;
        this.parent = parent;
        this.content = content || '​';
        this.messageContent = '';
        this.options = options;
        this.limit = options.limit || 1900;
        this.splitted = this.splitContent() || [' '];
        this.page = 1;
        this.author =
            context instanceof Message ? context.author : context.user;
        this.actions = [];
        this.wait = 1;
        this.message = undefined;
        this.argument = [];
        if (typeof this.content !== 'string') {
            throw new Error('Please pass valid content');
        }
    }

    async init() {
        this.messageContent = this.genText();
        this.message =
            this.context instanceof Message
                ? await this.context.reply(
                      this.filterSecret(this.messageContent)
                  )
                : await this.context.editReply({
                      content: this.filterSecret(this.messageContent)
                  });
    }

    async addAction(actions: Action[], args?: Record<string, any>) {
        if (!this.message) return;

        this.actions.push(...actions);
        this.args = args || {};

        this.args.manager = this;

        this.createMessageComponentMessage();
        this.messageComponentCollector = new InteractionCollector(
            this.parent.client,
            {
                componentType: ComponentType.Button,
                filter: (interaction) =>
                    Boolean(
                        this.actions.find(
                            (e) =>
                                // @ts-ignore
                                e.button.data.custom_id === interaction.customId
                        ) && interaction.user.id === this.author.id
                    ),
                time: 300000,
                dispose: true,
                message: this.message
            }
        );

        this.messageComponentCollector.on('collect', (component) => {
            const event = this.actions.find(
                // @ts-ignore
                (e) => e.button.data.custom_id === component.customId
            );
            if (!event) return;
            component.deferUpdate();
            event.action(this.args);
        });

        this.messageComponentCollector.on('end', () => {
            this.message?.edit({ components: [] }).catch(() => {});
        });
    }

    async createMessageComponentMessage() {
        if (this.options.noCode && this.splitted.length < 2) return;
        const buttons = this.actions
            .filter((el) => !(el.requirePage && this.splitted.length <= 1))
            .map((el) => el.button);
        if (buttons.length <= 0) return;
        const actionRow = new Discord.ActionRowBuilder<ButtonBuilder>({
            components: buttons
        });
        this.message?.edit({ components: [actionRow] }).catch(() => {});
    }

    filterSecret(string: string) {
        string = string.replace(
            new RegExp(this.parent.client.token!, 'gi'),
            '--snip--'
        );

        if (this.parent.options!.secrets) {
            for (const sec of this.parent.options!.secrets) {
                string = string.replace(
                    new RegExp(escapeRegex(sec), 'gi'),
                    '--snip--'
                );
            }
        }

        return string;
    }

    updatePage(num: number) {
        if (!this.message) return;
        if (this.splitted.length < num || num < 1)
            throw new Error('Invalid page.');
        this.page = num;

        this.genText();
        this.update();
    }

    nextPage() {
        if (this.page >= this.splitted.length) return;

        this.updatePage(this.page + 1);
    }

    previousPage() {
        if (this.page <= 1) return;

        this.updatePage(this.page - 1);
    }

    update() {
        if (!this.message) return;
        this.splitted = this.splitContent();
        if (this.wait === 0) this.messageContent = this.genText();
        else if (this.wait % 2 === 0) {
            this.wait = 0;
            setTimeout(() => {
                this.messageContent = this.genText();
                this.edit();
                this.wait++;
            }, 1000);
        } else {
            this.messageContent = this.genText();
            this.edit();
            this.wait++;
        }
    }

    edit() {
        if (this.splitted.length > 1) this.createMessageComponentMessage();
        this.message
            ?.edit(this.filterSecret(this.messageContent))
            .catch(() => {});
    }

    add(content: string) {
        if (!this.message) return;
        this.content += content;

        this.update();
    }

    destroy() {
        this.message?.edit({ components: [] }).catch(() => {});
        this.messageComponentCollector?.stop();
    }

    genText() {
        return this.splitted.length === 1
            ? `${codeBlock.construct(
                  this.splitted[this.page - 1]!,
                  this.options.lang
              )}`
            : `${codeBlock.construct(
                  this.splitted[this.page - 1]!,
                  this.options.lang
              )}\nPage ${this.page}/${this.splitted.length}`;
    }

    splitContent() {
        const char = [new RegExp(`.{1,${this.limit}}`, 'g'), '\n'];
        const text = Discord.verifyString(this.content);
        if (text.length <= this.limit) return [text];
        let splitText = [text];

        while (
            char.length > 0 &&
            splitText.some((elem) => elem.length > this.limit)
        ) {
            const currentChar = char.shift();
            if (currentChar instanceof RegExp) {
                splitText = splitText
                    .flatMap((chunk) => chunk.match(currentChar))
                    .filter((value) => value !== null) as string[];
            } else {
                splitText = splitText.flatMap((chunk) =>
                    chunk.split(currentChar!)
                );
            }
        }
        if (splitText.some((elem) => elem.length > this.limit)) {
            throw new RangeError('SPLIT_MAX_LEN');
        }
        const messages = [];
        let msg = '';
        for (const chunk of splitText) {
            if (msg && (msg + char + chunk).length > this.limit) {
                messages.push(msg);
                msg = '';
            }
            msg += (msg && msg !== '' ? char : '') + chunk;
        }
        return messages.concat(msg).filter((m) => m);
    }
}
