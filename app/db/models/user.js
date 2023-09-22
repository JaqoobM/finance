const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ValidateEmail } = require('../validators');

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
		trim: true,
		lowercase: true,
		unique: true,
		validate: [ValidateEmail, 'Email jest nieprawidłowy']
	},

	password: {
		required: true,
		type: String,
	},
});

userSchema.post('save', function (e, doc, next) {
	if (e.code === 11000) {
		e.errors = { email: { message: 'Ten email jest już zajęty' } };
	}
	next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
