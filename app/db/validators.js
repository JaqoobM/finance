module.exports = {
	ValidateEmail(email) {
		const re = /^\w+([/.-]?w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
		return re.test(email);
	},
};
