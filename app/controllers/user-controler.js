const User = require('../db/models/user');

class UserControler {
	showRegister(req, res) {
		res.render('pages/auth/register');
	}

	async register(req, res) {
		const user = new User({
			email: req.body.email,
			password: req.body.password,
		});

		try {
			await user.save();
			res.redirect('/zarejestruj');
		} catch (e) {
			console.log('BŁĄD REJESTRACJI');
			res.render('pages/auth/register', {
				errors: e.errors,
			});
		}
	}

	// async login(req, res) {

	// }

	showLogin(req, res) {
		res.render('pages/auth/login');
	}
}

module.exports = new UserControler();
