const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
	},

	password: {
		required: true,
		type: String,
	},
});

const User = mongoose.model('User', userSchema);

module.exports = User;
