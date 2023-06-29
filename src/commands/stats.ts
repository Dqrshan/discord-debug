import { ChatInputCommandInteraction, Message } from 'discord.js';
import { Command } from '../lib/Command';
import { EmbedBuilder } from '@discordjs/builders';
import si from 'systeminformation';

const command: Command = {
  name: 'stats',
  aliases: ['st'],
  description: 'Returns the machine\'s statistics for this instance.',
  messageRun: async (message, _, __) => {
    await help(message);
  },
  interactionRun: async (interaction, _) => {
    await help(interaction);
  }
};

export default command;

const help = async (ctx: Message | ChatInputCommandInteraction) => {
  const cpuInfo = await si.cpu();
  const cpuCores = cpuInfo.cores;
  const cpuManufacturer = cpuInfo.manufacturer;
  const cpuBrand = cpuInfo.brand;

  const diskIO = await si.disksIO();
  const diskReads = await getReadableFileSize(diskIO.rIO_sec);
  const diskWrites = await getReadableFileSize(diskIO.wIO_sec);

  const networkStats = await si.networkStats();
  const networkUsage = await getReadableFileSize(networkStats[0].tx_sec);

  const totalMemory = await getReadableMemorySizeMB((await si.mem()).total);
  const freeMemory = await getReadableMemorySizeMB((await si.mem()).free);
  const diskUsage = (await si.fsSize())[0].use;
  const uptime = await getUnixTimestamp();
  const systemTemperature = (await si.cpuTemperature()).main;
  const processCount = (await si.processes()).all;
  const systemLoad = (await si.currentLoad()).avgLoad;
  const osInfo = await si.osInfo();
  const memoryUsage = await getReadableMemorySize((await si.mem()).used);

  const embed = new EmbedBuilder()
    .addFields({ name: `CPU`, value: `- Model: ${cpuManufacturer} ${cpuBrand}\n- Number of cores: ${cpuCores}\n- Temperature: ${systemTemperature}°C`, inline: true})
    .addFields({ name: `Disk I/O`, value: `- Usage: ${diskUsage}%\n- Reads: ${diskReads}/s\n- Writes: ${diskWrites}/s`, inline: true})
    .addFields({ name: `Network I/O`, value: `- Usage: ${networkUsage}/s\n- Total Memory: ${totalMemory}\n- Free Memory: ${freeMemory}`, inline: false})
    .addFields({ name: `Uptime`, value: `<t:${uptime}:R>`, inline: false})
    .addFields({ name: `Process Count`, value: `${processCount}`, inline: true})
    .addFields({ name: `System Load`, value: `${systemLoad}% (per minute)`, inline: true})
    .addFields({ name: `OS Info`, value: `- Platform: ${osInfo.platform}\n- Distribution: ${osInfo.distro} ${osInfo.release} ${osInfo.arch}\n`, inline: false})
    .addFields({ name: `Memory Usage`, value: `${memoryUsage}`, inline: false})

  return ctx.reply({ embeds: [embed] });
};

async function getUnixTimestamp() {
    const uptimeInSeconds = Math.round(process.uptime());
    return Math.floor(Date.now() / 1000) - uptimeInSeconds;
  }

async function getReadableMemorySize(size: number) {
  if (size < 1024) {
    return `${size}B`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)}KB`;
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)}MB`;
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)}GB`;
  }
}

async function getReadableMemorySizeMB(size: number) {
  return `${(size / (1024 * 1024)).toFixed(2)}MB`;
}

async function getReadableFileSize(size: number | null) {
  if (size === null) {
    return 'N/A';
  } else if (size < 1024) {
     return `${(size / 1024).toFixed(2)} KB`;
  } else if (size < 1024 * 1024) {
     return `${(size / 1024).toFixed(2)} KB`;
  } else if (size < 1024 * 1024 * 1024) {
     return `${(size / 1024).toFixed(2)} KB`;
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)}GB`;
  }
}
