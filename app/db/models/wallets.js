const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const walletSchema = new Schema({
	name: {
		required: true,
		type: String,
	},

	amount: {
		required: true,
		type: String,
	},
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
