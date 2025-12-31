const { EmbedBuilder } = require('discord.js');

const { cleanupExpiredPunishments } = require('../../functions/cleanup-expired-punishments');
const { formatExpiryDate } = require('../../formatters/expiration-dates');
const { generatePunishmentId } = require('../../formatters/punishment-ids');
const { punishmentLogId } = require('../../channels/log-channel');
const Infraction = require('../../schemas/manual-punishments');

const warning = new Set();

module.exports = {
    name: 'warn',
    description: 'Warns a target.',
    usage: '>warn [target] [reason]',
    examples: ['>warn 1454985695608180783 loser'],
    aliases: ['w', 'fine', 'cite'],
    flags: ['--p', '--perm', '--permanent', '--s', '--silent'],
    staffOnly: true,
    async execute(message, args, client) {
        const { author, guild, mentions } = message;

        const permanentFlag = args.includes('--p') || args.includes('--perm') || args.includes('--permanent');
        const silentFlag = args.includes('--s') || args.includes('--silent');

        const blockedFlags = ['--p', '--perm', '--permanent', '--s', '--silent'];
        args = args.filter(arg => !blockedFlags.includes(arg));

        let userId;
        let reason;
        let warnLog;
        let expires = null;

        if (!permanentFlag) {
            expires = new Date();
            expires.setDate(expires.getDate() + 30);
        }

        if (!args.length) {
            await message.channel.send('You must provide a member to warn.');

            return;
        }

        userId = mentions.users.first() ? mentions.users.first().id : args[0];
        reason = args.slice(1).join(' ');

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

        if (!reason) {
            await message.channel.send('You must provide a reason.');

            return;
        }

        warning.add(member.id);

        try {
            const punishmentId = await generatePunishmentId();

            const warn = new Infraction({
                punishmentId: punishmentId,
                type: 'Warn',
                reason: reason,
                userId: member.id,
                staffId: author.id,
                issued: new Date().toLocaleString(),
                expires: expires ? expires.toLocaleString() : null,
            });

            await warn.save();
            await message.delete();

            await message.channel.send(`Warned <@${member.id}>. (${punishmentId})`)

            warnLog = guild.channels.cache.get(punishmentLogId);

            if (warnLog) {
                await message.channel.send(`Punishment warn for ${member.user.username} (${member.id}) logged\n-# Punishment ID: ${punishmentId}`)
            }

            if (!silentFlag) {
                const embed = new EmbedBuilder()
                .setColor('#fcd44f')
                .setAuthor({ name: `${client.user.username}`, iconURL: `${client.user.displayAvatarURL()}` })
                .setTitle(`You've been warned in ${guild.name}`)
                .addFields(
                    { name: 'Reason', value: `${reason}` },
                    { name: 'Expires', value: expires ? formatExpiryDate(expires) : 'Never' }
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