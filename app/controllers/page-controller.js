const Cost = require('../db/models/costs');
const Category = require('../db/models/categories');
const Wallet = require('../db/models/wallets');

class PageController {
	showHome(req, res) {
		res.render('pages/home');
	}

	async showPanel(req, res) {
		const { q, sort, minamount, maxamount, category, type, wallet } = req.query;
		const page = req.query.page || 1;
		const perPage = 5;
		const where = {};

		// SERCH
		if (q) {
			where.name = { $regex: q, $options: 'i' };
		}

		if (category) {
			where.category = category;
		}

		if (type) {
			where.type = type;
		}

		if (wallet) {
			where.wallet = wallet;
		}

		// RANGE
		if (minamount || maxamount) {
			where.amount = {};
			if (minamount) where.amount.$gte = minamount;
			if (maxamount) where.amount.$lte = maxamount;
		}

		let query = Cost.find(where);

		// PAGINATION
		query = query.limit(perPage);
		query = query.skip((page - 1) * perPage);

		// SORT
		if (sort) {
			const s = sort.split('|');
			query = query.sort({ [s[0]]: s[1] });
		}

		// EXEC
		const costs = await query.exec();
		const categories = await Category.find({});
		const pagesCount = await Cost.find(where).count();
		const wallets = await Wallet.find({});
		const resultsCount = Math.ceil(pagesCount / perPage);

		res.render('pages/panel/panel', {
			costs,
			query: req.query,
			resultsCount,
			page,
			categories,
			wallets,
		});
	}

	async showCategories(req, res) {
		const incomeCategories = await Category.find({ type: 'dochód' });
		const costCategories = await Category.find({ type: 'koszt' });

		res.render('pages/categories', {
			incomeCategories,
			costCategories,
		});
	}

	showAddCategoryCost(req, res) {
		res.render('pages/add-category-cost');
	}

	showAddCategoryIncome(req, res) {
		res.render('pages/add-category-income');
	}

	async addCategoryCost(req, res) {
		const category = new Category({
			category: req.body.category,
			type: 'koszt',
		});

		try {
			await category.save();
			res.redirect('/panel/kategorie');
		} catch (e) {
			console.log('BŁĄD PRZY ZAPISIE KATEGORII KOSZTU');
		}
	}

	async addCategoryIncome(req, res) {
		const category = new Category({
			category: req.body.category,
			type: 'dochód',
		});

		try {
			await category.save();
			res.redirect('/panel/kategorie');
		} catch (e) {
			console.log('BŁĄD PRZY ZAPISIE KATEGORII DOCHODU');
		}
	}

	async showEditCostCategory(req, res) {
		const { name } = req.params;

		const category = await Category.findOne({ category: name });

		res.render('pages/edit-category', {
			category,
		});
	}

	async editCostCategory(req, res) {
		const { name } = req.params;

		const category = await Category.findOne({ category: name });
		category.category = req.body.category;

		try {
			category.save();
			res.redirect('/panel/kategorie');
		} catch (e) {
			console.log('BŁĄD PRZY EDYCJI KATEGORII');
		}
	}

	async deleteCategory(req, res) {
		const { name } = req.params;

		try {
			await Category.deleteOne({ category: name });
			res.redirect('/panel/kategorie');
		} catch (e) {
			console.log('BŁĄD PRZY USUWANIU KATEGORII');
		}
	}

	async showAddPage(req, res) {
		const categories = await Category.find({});

		res.render('pages/add', {
			categories,
		});
	}

	async showAddIncome(req, res) {
		const categories = await Category.find({ type: 'dochód' });
		const wallets = await Wallet.find({});

		res.render('pages/add-income', {
			categories,
			wallets,
		});
	}

	async addIncome(req, res) {
		const cost = new Cost({
			name: req.body.name,
			amount: req.body.amount,
			date: req.body.date,
			wallet: req.body.wallet,
			category: req.body.category,
			type: 'dochód',
		});

		const wallet = await Wallet.findOne({ name: cost.wallet });
		const walletAmount = wallet.amount;
		const costAmount = cost.amount;

		wallet.amount = Number(walletAmount) + Number(costAmount);

		try {
			await cost.save();
			await wallet.save();
			res.redirect('/panel');
		} catch (e) {
			console.log('BŁĄD PRZY ZAPISIE DOCHODU');
		}
	}

	async showAddCost(req, res) {
		const categories = await Category.find({ type: 'koszt' });
		const wallets = await Wallet.find({});

		res.render('pages/add-cost', {
			categories,
			wallets,
		});
	}

	async addCost(req, res) {
		const cost = new Cost({
			name: req.body.name,
			amount: req.body.amount,
			date: req.body.date,
			wallet: req.body.wallet,
			category: req.body.category,
			type: 'koszt',
		});

		const wallet = await Wallet.findOne({ name: cost.wallet });
		const walletAmount = wallet.amount;
		const costAmount = cost.amount;

		wallet.amount = Number(walletAmount) - Number(costAmount);

		try {
			await cost.save();
			await wallet.save();
			res.redirect('/panel');
		} catch (e) {
			console.log('BŁĄD PRZY ZAPISIE KOSZTU');
		}
	}

	async showEditCost(req, res) {
		const { name } = req.params;

		const cost = await Cost.findOne({ name: name });
		const wallet = await Wallet.findOne({ name: cost.wallet });
		const wallets = await Wallet.find({});

		let categories;
		if (cost.type === 'dochód') {
			categories = await Category.find({ type: 'dochód' });
		} else {
			categories = await Category.find({ type: 'koszt' });
		}

		res.render('pages/panel/costs/edit', {
			cost,
			categories,
			wallets,
			wallet,
		});
	}

	async editCost(req, res) {
		const { name } = req.params;

		const cost = await Cost.findOne({ name: name });
		const oldWallet = await Wallet.findOne({ name: cost.wallet });
		const type = cost.type;
		const oldType = type;
		const oldAmount = cost.amount;

		cost.name = req.body.name;
		cost.amount = req.body.amount;
		cost.date = req.body.date;
		cost.category = req.body.category;
		cost.type = req.body.type;
		cost.wallet = req.body.wallet;

		const newWallet = await Wallet.findOne({ name: cost.wallet });
		const newType = cost.type;
		const newAmount = cost.amount;

		if (
			oldWallet.name == newWallet.name &&
			oldAmount == newAmount &&
			oldType == 'dochód' &&
			newType == 'koszt'
		) {
			oldWallet.amount = Number(oldWallet.amount) - oldAmount * 2;
		} else if (
			oldWallet.name == newWallet.name &&
			oldAmount == newAmount &&
			oldType == 'koszt' &&
			newType == 'dochód'
		) {
			oldWallet.amount = Number(oldWallet.amount) + oldAmount * 2;
		} else if (
			oldWallet.name != newWallet.name &&
			oldAmount == newAmount &&
			oldType == 'dochód' &&
			newType == 'koszt'
		) {
			oldWallet.amount = Number(oldWallet.amount) - oldAmount;
			newWallet.amount = Number(newWallet.amount) - oldAmount;
		} else if (
			oldWallet.name != newWallet.name &&
			oldAmount == newAmount &&
			oldType == 'koszt' &&
			newType == 'dochód'
		) {
			oldWallet.amount = Number(oldWallet.amount) + oldAmount;
			newWallet.amount = Number(newWallet.amount) + oldAmount;
		} else if (
			oldWallet.name == newWallet.name &&
			oldAmount != newAmount &&
			oldType == 'dochód' &&
			newType == 'koszt'
		) {
			oldWallet.amount = Number(oldWallet.amount) - (oldAmount + newAmount);
		} else if (
			oldWallet.name == newWallet.name &&
			oldAmount != newAmount &&
			oldType == 'koszt' &&
			newType == 'dochód'
		) {
			oldWallet.amount = Number(oldWallet.amount) + (oldAmount + newAmount);
		} else if (
			oldWallet.name != newWallet.name &&
			oldAmount != newAmount &&
			oldType == 'dochód' &&
			newType == 'koszt'
		) {
			oldWallet.amount = Number(oldWallet.amount) - oldAmount;
			newWallet.amount = Number(newWallet.amount) - newAmount;
		} else if (
			oldWallet.name != newWallet.name &&
			oldAmount != newAmount &&
			oldType == 'koszt' &&
			newType == 'dochód'
		) {
			oldWallet.amount = Number(oldWallet.amount) + oldAmount;
			newWallet.amount = Number(newWallet.amount) + newAmount;
		} else if (
			oldWallet.name != newWallet.name &&
			oldAmount == newAmount &&
			oldType == 'dochód' &&
			newType == 'dochód'
		) {
			oldWallet.amount = Number(oldWallet.amount) - oldAmount;
			newWallet.amount = Number(newWallet.amount) + oldAmount;
		} else if (
			oldWallet.name != newWallet.name &&
			oldAmount == newAmount &&
			oldType == 'koszt' &&
			newType == 'koszt'
		) {
			oldWallet.amount = Number(oldWallet.amount) + oldAmount;
			newWallet.amount = Number(newWallet.amount) - oldAmount;
		} else if (
			oldWallet.name == newWallet.name &&
			oldAmount != newAmount &&
			oldType == 'dochód' &&
			newType == 'dochód'
		) {
			oldWallet.amount = Number(oldWallet.amount) - oldAmount;
			oldWallet.amount = Number(oldWallet.amount) + newAmount;
		} else if (
			oldWallet.name == newWallet.name &&
			oldAmount != newAmount &&
			oldType == 'koszt' &&
			newType == 'koszt'
		) {
			oldWallet.amount = Number(oldWallet.amount) + oldAmount;
			oldWallet.amount = Number(oldWallet.amount) - newAmount;
		} else if (
			oldWallet.name != newWallet.name &&
			oldAmount != newAmount &&
			oldType == 'dochód' &&
			newType == 'dochód'
		) {
			oldWallet.amount = Number(oldWallet.amount) - oldAmount;
			newWallet.amount = Number(oldWallet.amount) + newAmount;
		} else if (
			oldWallet.name != newWallet.name &&
			oldAmount != newAmount &&
			oldType == 'koszt' &&
			newType == 'koszt'
		) {
			oldWallet.amount = Number(oldWallet.amount) + oldAmount;
			newWallet.amount = Number(oldWallet.amount) - newAmount;
		}

		try {
			await cost.save();
			await oldWallet.save();
			await newWallet.save();
			res.redirect('/panel');
		} catch (e) {
			console.log('BŁĄD PRZY EDYCJI');
		}
	}

	async deleteCost(req, res) {
		const { name } = req.params;
		let id = req.params.id || 1;

		const costs = await Cost.find({});
		const costsCount = costs.length;
		const test = costsCount % 5;

		if (test == 1 && costsCount > 1) {
			id = Number(id) - 1;
		}

		const cost = await Cost.findOne({ name: name });
		const wallet = await Wallet.findOne({ name: cost.wallet });
		const walletAmount = wallet.amount;
		const costAmount = cost.amount;

		if (cost.type == 'dochód') {
			wallet.amount = Number(walletAmount) - Number(costAmount);
		} else if (cost.type == 'koszt') {
			wallet.amount = Number(walletAmount) + Number(costAmount);
		}

		try {
			await cost.delete();
			await wallet.save();
			res.redirect(`/panel/?page=${id}`);
		} catch (e) {
			console.log('BŁĄD PRZY USUWANIU');
		}
	}

	async showWallets(req, res) {
		const wallets = await Wallet.find({});

		res.render('pages/panel/wallets/wallets', {
			wallets,
		});
	}

	showAddWallet(req, res) {
		res.render('pages/panel/wallets/add-wallet');
	}

	async addWallet(req, res) {
		const wallet = new Wallet({
			name: req.body.name,
			amount: req.body.amount,
		});

		try {
			wallet.save();
			res.redirect('/panel');
		} catch (e) {
			console.log('BŁĄD PRZY ZAPISIE PORTFELA');
		}
	}

	async showEditWallet(req, res) {
		const { name } = req.params;

		const wallet = await Wallet.findOne({ name: name });

		res.render('pages/edit-wallet', {
			wallet,
		});
	}

	async editWallet(req, res) {
		const { name } = req.params;

		const wallet = await Wallet.findOne({ name: name });
		wallet.name = req.body.name;
		wallet.amount = req.body.amount;

		try {
			wallet.save();
			res.redirect('/panel/portfele');
		} catch (e) {
			console.log('BŁĄD PRZY EDYCJI PORTFELA');
		}
	}

	async deleteWallet(req, res) {
		const { name } = req.params;

		try {
			await Cost.deleteMany({ wallet: name });
			await Wallet.deleteOne({ name: name });
			res.redirect('/panel/portfele');
		} catch (e) {
			console.log('BŁĄD PRZY USUWANIIU PORTFELA');
		}
	}
}

module.exports = new PageController();
