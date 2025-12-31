const Infraction = require('../schemas/manual-punishments');
const { formatExpiryDate } = require('../formatters/expiration-dates');

async function cleanupExpiredPunishments() {
    try {
        const expiredPunishment = await Infraction.find({ expires: { $lte: new Date(Date.now()).toLocaleString() }});

        for (const punishment of expiredPunishment) {
            await Infraction.findByIdAndDelete(punishment._id);
            console.log(`Punishment ${punishment.type} (${punishment.punishmentId}) deleted.`);
        }
    } catch (error) {
        console.error(`An error occurred while deleting this punishment:\n${error}`);
    }
}

module.exports = { cleanupExpiredPunishments };