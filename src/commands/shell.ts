import child from 'child_process';
import Discord, { ChatInputCommandInteraction, Message } from 'discord.js';
import type { Debugger } from '../';
import { Paginator, codeBlock } from '../lib';
import { Command } from '../lib/Command';

const command: Command = {
    name: 'shell',
    aliases: ['sh', 'exec', 'bash'],
    description: 'Executes a shell command',
    messageRun: async (message, parent, args) => {
        await shell(message, parent, args);
    },
    interactionRun: async (interaction, parent) => {
        if (!interaction.deferred) await interaction.deferReply();
        await shell(
            interaction,
            parent,
            interaction.options.getString('command')!
        );
    }
};

export default command;

const shell = async (
    message: Message | ChatInputCommandInteraction,
    parent: Debugger,
    args: string
) => {
    const isMsg = message instanceof Message;
    if (!args) return message.reply('Missing Arguments.');

    const shell =
        process.env.SHELL ||
        (process.platform === 'win32'
            ? 'powershell'
            : process.platform === 'linux'
            ? '/bin/bash'
            : null);
    if (!shell) {
        return isMsg
            ? message.reply(
                  'Unable to find your default shell.\nPlease set `process.env.SHELL`.'
              )
            : await message.editReply(
                  'Unable to find your default shell.\nPlease set `process.env.SHELL`.'
              );
    }
    const msg = new Paginator(message, `$ ${args}\n`, parent, {
        lang: 'shell'
    });
    await msg.init();

    const res = child.spawn(shell, [
        '-c',
        (shell === 'win32' ? 'chcp 65001\n' : '') + args
    ]);
    const timeout = setTimeout(async () => {
        kill(res, 'SIGTERM');
        isMsg
            ? message.reply('Shell timeout.')
            : await message.editReply('Shell timeout.');
    }, 180000);

    await msg.addAction(
        [
            {
                button: new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Danger)
                    .setCustomId('debug$prev')
                    .setLabel('Prev'),
                action: ({ manager }) => manager.previousPage(),
                requirePage: true
            },
            {
                button: new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Secondary)
                    .setCustomId('debug$stop')
                    .setLabel('Stop'),
                action: async ({ res, manager }) => {
                    res.stdin.pause();
                    await kill(res);
                    msg.add('^C');
                    manager.destroy();
                },
                requirePage: true
            },
            {
                button: new Discord.ButtonBuilder()
                    .setStyle(Discord.ButtonStyle.Success)
                    .setCustomId('debug$next')
                    .setLabel('Next'),
                action: ({ manager }) => manager.nextPage(),
                requirePage: true
            }
        ],
        { res }
    );

    res.stdout.on('data', (data) => {
        msg.add('\n' + data.toString());
    });

    res.stderr.on('data', (data) => {
        msg.add(`\n[stderr] ${data.toString()}`);
    });

    res.on('error', async (err) => {
        return isMsg
            ? message.reply(
                  `Error occurred while spawning process\n${codeBlock.construct(
                      err.toString(),
                      'sh'
                  )}`
              )
            : await message.editReply(
                  `Error occurred while spawning process\n${codeBlock.construct(
                      err.toString(),
                      'sh'
                  )}`
              );
    });
    res.on('close', (code) => {
        clearTimeout(timeout);
        msg.add(`\n[status] process exited with code ${code}`);
    });
};

function kill(res: any, signal?: NodeJS.Signals) {
    if (process.platform === 'win32') {
        return child.exec(
            `powershell -File "..\\lib\\KillChildrenProcess.ps1" ${res.pid}`,
            { cwd: __dirname }
        );
    } else return res.kill('SIGINT' || signal);
}
