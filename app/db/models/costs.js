const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const costSchema = new Schema({
	name: {
		type: String,
		required: true,
	},

	amount: {
		type: Number,
		required: true,
	},

	date: {
		type: String,
		required: true,
	},

	category: {
		type: String,
		required: true,
	},

	type: {
		type: String,
		reqiured: true,
	},

	wallet: {
		type: String,
		required: true,
	},
});

const Cost = mongoose.model('Cost', costSchema);

module.exports = Cost;
