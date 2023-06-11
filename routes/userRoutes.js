const express = require('express')
const router = express.Router();

const validateUnsubscribeUser = require('../middlewares/unsubscribeMiddleware');
const checkUserData = require('../middlewares/checkUserData');

const userController = require('../controllers/userController');
const unsubscribeUserController = require('../controllers/unsubscribeUserController');

router.post('/middleware', checkUserData, userController.createUser)

// route de desabonnement
router.put('/unsubscribe/:id', unsubscribeUserController);

module.exports = router;