const mongoose = require('mongoose')
const config = require("../config").getConfig();

const participantSchema = new mongoose.Schema({
    token: { type: String, index: true },
    id_presentation: { type: String, index: true },
    pseudo: String,
    active: Boolean,
    score: Number,
    responses: {
        type: Map,
        of: Number
    }
})

participantSchema.set('autoIndex', !config.is_production);

module.exports = mongoose.model('Participant', participantSchema)