import {
    ChatInputCommandInteraction,
    EmbedBuilder,
    Message,
    bold,
    inlineCode
} from 'discord.js';
import { Command } from '../lib/Command';
import { Debugger } from '..';
import os from 'node:os';
import { DateFormat, System, plural } from '../lib';

const command: Command = {
    name: 'stats',
    aliases: ['statistics'],
    description: "View the machine's statistics for this instance.",
    messageRun: async (message, parent, __) => {
        await stats(message, parent);
    },
    interactionRun: async (interaction, parent) => {
        await stats(interaction, parent);
    }
};

export default command;

const stats = async (
    ctx: Message | ChatInputCommandInteraction,
    parent: Debugger
) => {
    const {} = process.resourceUsage();

    const cpuu = (await new Promise((resolve) => {
        cpuUsage((cpu: number) => {
            resolve(cpu);
        });
    })) as number;

    const [_, free, used] = (
        (await new Promise((resolve) => {
            hardDriveInfo((total: number, free: number, used: number) => {
                resolve([total, free, used]);
            });
        })) as number[]
    ).map((x) => formatSize(x));

    let loads = os.loadavg().map(function (x) {
        return x / os.cpus().length;
    });
    let avgLoad = parseFloat(Math.max.apply(Math, loads).toFixed(2));

    const embed = new EmbedBuilder()
        .setTitle(
            `${os.hostname} ${inlineCode(
                os.machine()
            )}, ${os.type()} ${inlineCode(os.arch())}`
        )
        .setColor(parent.options!.themeColor!)
        .setFooter({
            text: `${os.cpus()[0].model}, ${plural(
                os.cpus().length,
                'core'
            )}, speed: ${sum(os.cpus().map((x) => x.speed))} MHz`
        })
        .setFields(
            {
                name: `Uptime`,
                value: DateFormat.format(System.processReadyAt(), 'R'),
                inline: true
            },
            {
                name: 'System Load',
                value: `${avgLoad}%`,
                inline: true
            },
            {
                name: 'CPU Usage',
                value: `${(cpuu * 100).toFixed(2)}%`,
                inline: true
            },
            {
                name: `Memory`,
                value: `${System.memory().rss} / ${formatSize(
                    os.totalmem()
                )} (${formatSize(os.freemem())} free)`,
                inline: true
            },
            {
                name: 'Hard Drive',
                value: `${used} used, ${free} remaining`,
                inline: true
            },
            {
                name: 'Platform',
                value: `${bold(os.platform())} ${inlineCode(os.release())}`,
                inline: false
            }
        );

    return ctx.reply({ embeds: [embed] });
};

const formatSize = (size: number) => {
    if (size < 1024) {
        return `${size}B`;
    } else if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(2)}KB`;
    } else if (size < 1024 * 1024 * 1024) {
        return `${(size / (1024 * 1024)).toFixed(2)}MB`;
    } else {
        return `${(size / (1024 * 1024 * 1024)).toFixed(2)}GB`;
    }
};

const sum = (arr: number[]) => {
    return arr.reduce((a, b) => a + b, 0);
};

const cpuUsage = (callback: Function) => {
    var stats1 = cpuInfo();
    var startIdle = stats1.idle;
    var startTotal = stats1.total;

    setTimeout(function () {
        var stats2 = cpuInfo();
        var endIdle = stats2.idle;
        var endTotal = stats2.total;

        var idle = endIdle - startIdle;
        var total = endTotal - startTotal;
        var perc = idle / total;

        callback(1 - perc);
    }, 1000);
};

const cpuInfo = () => {
    var cpus = os.cpus();

    var user = 0;
    var nice = 0;
    var sys = 0;
    var idle = 0;
    var irq = 0;
    var total = 0;

    for (var cpu in cpus) {
        if (!cpus.hasOwnProperty(cpu)) continue;
        user += cpus[cpu].times.user;
        nice += cpus[cpu].times.nice;
        sys += cpus[cpu].times.sys;
        irq += cpus[cpu].times.irq;
        idle += cpus[cpu].times.idle;
    }

    var total = user + nice + sys + idle + irq;

    return {
        idle: idle,
        total: total
    };
};

const hardDriveInfo = (callback: Function) => {
    require('child_process').exec(
        'df -k',
        (_: any, stdout: string, __: any) => {
            var total = 0;
            var used = 0;
            var free = 0;

            var lines = stdout.split('\n');

            var str_disk_info = lines[1].replace(/[\s\n\r]+/g, ' ');

            var disk_info = str_disk_info.split(' ');

            total = Math.ceil(parseInt(disk_info[1]) * 1024 * 1024) / 10;
            used = Math.ceil(parseInt(disk_info[2]) * 1024 * 1024) / 10;
            free = Math.ceil(parseInt(disk_info[3]) * 1024 * 1024) / 10;

            callback(total, free, used);
        }
    );
};
