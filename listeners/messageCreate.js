require('dotenv').config();

const { Collection } = require('discord.js');
const { formatCooldown } = require('../formatters/cooldowns')
const config = require('../config');

async function handleMessage(message, client) {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    const ownerPerms = config.owners.includes(message.author.id);
    const adminPerms = config.admins.includes(message.author.id);

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (!ownerPerms || !adminPerms) {
        if (command.ownerOnly && !config.owners.includes(message.author.id)) {
            return message.delete();
        }

        if (command.adminOnly && !config.admins.includes(message.author.id)) {
            return message.delete();
        }

        if (command.hmodOnly && !config.hmods.includes(message.author.id)) {
            return message.delete();
        }

        if (command.staffOnly && !config.staff.includes(message.author.id)) {
            return message.delete();
        }
    }

    if (!ownerPerms || !adminPerms) {
        if (!client.cooldowns) {
            client.cooldowns = new Collection();
        }

        if (!client.cooldowns.has(command.name)) {
            client.cooldowns.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamp = client.cooldowns.get(command.name);
        const cooldown = (command.cooldown) * 1000;

        if (timestamp.has(message.author.id)) {
            const expiration = timestamp.get(message.author.id) + cooldown;

            if (now < expiration) {
                const timeLeft = (expiration - now) / 1000;
                const time = formatCooldown(timeLeft);

                const msg = await message.channel.send(`You may not use the \`${command.name}\` command for another **${time}**.`);

                setTimeout(() => {
                    message.delete();
                    msg.delete();
                }, 3000);

                return;
            }
        }

        timestamp.set(message.author.id, now);
        setTimeout(() => timestamp.delete(message.author.id), cooldown);
    }

    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(`An error occurred running this command:\n${error}`);
        await message.channel.send('An unknown error occurred while running this command. Please try again later.');

        return;
    }
};

module.exports = { handleMessage };