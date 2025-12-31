const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    punishmentId: { type: String, required: true },
    type: { type: String, required: true },
    reason: { type: String, required: true },
    userId: { type: String, required: true },
    staffId: { type: String, required: true },
    issued: { type: String, required: true },
    duration: { type: String },
    expires: { type: String },
});

module.exports = mongoose.model('Infraction', schema, 'manual-punishments');