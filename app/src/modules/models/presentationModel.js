const mongoose = require('mongoose')
const config = require("../config").getConfig();

const presentationSchema = new mongoose.Schema({
	id_presentation: { type: String, index: true },
	start_date: Number,
	active: Boolean,
	state: Number
})

presentationSchema.set('autoIndex', !config.is_production);

module.exports = mongoose.model('Presentation', presentationSchema)