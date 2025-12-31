const { EmbedBuilder } = require('discord.js');

const { cleanupExpiredPunishments } = require('../../functions/cleanup-expired-punishments');
const { formatExpiryDate } = require('../../formatters/expiration-dates');
const { generatePunishmentId } = require('../../formatters/punishment-ids');
const { punishmentLogId } = require('../../channels/log-channel');
const Infraction = require('../../schemas/manual-punishments');

const warning = new Set();

module.exports = {
    name: 'drama',
    aliases: ['d'],
    staffOnly: true,
    async execute(message, args, client) {
        const { author, guild, mentions } = message;

        let userId;
        let warnLog;
        let expires = new Date();

        expires.setDate(expires.getDate() + 30);

        if (!args.length) {
            await message.channel.send('You must provide a member to warn.');

            return;
        }

        userId = mentions.users.first() ? mentions.users.first().id : args[0];

        let member;

        try {
            member = await guild.members.fetch(userId);
        } catch (error) {
            await message.channel.send('You must provide a valid member to warn.');

            return;
        }

        if (member.user.bot) {
            await message.channel.send('You cannot warn a bot.');

            return;
        }

        if (member.id == author.id) {
            await message.channel.send('You cannot warn yourself.');

            return;
        }

        if (member.roles.highest.position >= message.member.roles.highest.position) {
            await message.channel.send('You cannot warn this member as they are higher than or equal to you in hierachy.');

            return;
        }

        if (warning.has(member.id)) {
            await message.channel.send('Whoops! Double warning prevented.');

            return;
        }

        warning.add(member.id);

        try {
            const punishmentId = await generatePunishmentId();

            const warn = new Infraction({
                punishmentId: punishmentId,
                type: 'Warn',
                reason: 'Causing drama and/or being toxic in chat by offending and/or insulting others or being unnecessarily rude. If you continue this behavior, you risk being banned from the server.',
                userId: member.id,
                staffId: author.id,
                issued: new Date().toLocaleString(),
                expires: expires.toLocaleString(),
            });

            await warn.save();
            await message.delete();

            await message.channel.send(`Warned <@${member.id}>. (${punishmentId})`)

            warnLog = guild.channels.cache.get(punishmentLogId);

            if (warnLog) {
                await warnLog.send(`Punishment warn for ${member.user.username} (${member.id}) logged\n-# Punishment ID: ${punishmentId}`)
            }

            if (!silentFlag) {
                const embed = new EmbedBuilder()
                .setColor('#fcd44f')
                .setAuthor({ name: `${client.user.username}`, iconURL: `${client.user.displayAvatarURL()}` })
                .setTitle(`You've been warned in ${guild.name}`)
                .addFields(
                    { name: 'Reason', value: `${reason}` },
                    { name: 'Expires', value: `${formatExpiryDate(expires)}` }
                )
                .setFooter({ text: `Punishment ID: ${punishmentId}` })
                .setTimestamp()

                await member.send({ embeds: [embed] }).catch((error) => {
                    console.error(`An error occurred while DMing this member:\n${error}`);
                });
            }
        } catch (error) {
            console.error(error);
            await message.channel.send('An unknown error occurred.');

            return;
        } finally {
            warning.delete(member.id);
        }
    },
};

(async () => {
    setInterval(async () => {
        const expired = await cleanupExpiredPunishments();

        if (!expired.length) {
            return;
        }
    }, 86400000);
})();