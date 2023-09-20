const express = require('express');
const router = new express.Router();
const PageController = require('../controllers/page-controller');
const UserControler = require('../controllers/user-controler');

router.get('/', PageController.showHome);

router.get('/panel', PageController.showPanel);

router.get('/panel/dodaj', PageController.showAddPage);
router.get('/panel/dodaj/dochod', PageController.showAddIncome);
router.post('/panel/dodaj/dochod', PageController.addIncome);
router.get('/panel/dodaj/koszt', PageController.showAddCost);
router.post('/panel/dodaj/koszt', PageController.addCost);

router.get('/panel/:name/edytuj', PageController.showEditCost);
router.post('/panel/:name/edytuj', PageController.editCost);

router.get('/panel/kategorie', PageController.showCategories);
router.get('/panel/kategorie/dodaj-koszt', PageController.showAddCategoryCost);
router.post('/panel/kategorie/dodaj-koszt', PageController.addCategoryCost);
router.get(
	'/panel/kategorie/dodaj-dochod',
	PageController.showAddCategoryIncome
);
router.post('/panel/kategorie/dodaj-dochod', PageController.addCategoryIncome);
router.get(
	'/panel/kategorie/:name/edytuj',
	PageController.showEditCostCategory
);
router.post('/panel/kategorie/:name/edytuj', PageController.editCostCategory);
router.get('/panel/kategorie/:name/usun', PageController.deleteCategory);

router.get('/panel/portfele', PageController.showWallets);
router.get('/panel/portfele/dodaj', PageController.showAddWallet);
router.post('/panel/portfele/dodaj', PageController.addWallet);
router.get('/panel/portfele/:name/edytuj', PageController.showEditWallet);
router.post('/panel/portfele/:name/edytuj', PageController.editWallet);
router.get('/panel/portfele/:name/usun', PageController.deleteWallet);

router.get('/zarejestruj', UserControler.showRegister);
router.post('/zarejestruj', UserControler.register);

router.get('/zaloguj', UserControler.showLogin);
// router.post('/zaloguj', UserControler.login);

router.get('/panel/:id/:name/usun', PageController.deleteCost);

module.exports = router;
