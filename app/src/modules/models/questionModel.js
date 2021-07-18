const mongoose = require('mongoose')
const config = require("../config").getConfig();

const questionSchema = new mongoose.Schema({
	id_presentation: { type: String, index: true },
	id_question: { type: Number, index: true },
	question: String,
	propositions: Array,
	id_response: Number,
	active: Boolean,
	responses: Array
})

questionSchema.set('autoIndex', !config.is_production);

module.exports = mongoose.model('Question', questionSchema)