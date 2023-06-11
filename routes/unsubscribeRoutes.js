const express = require('express')
const router = express.Router();

const validateUnsubscribeUser = require('../middlewares/unsubscribeMiddleware');

const unsubscribeUserController = require('../controllers/unsubscribeUserController');


// route de desabonnement
router.put('/unsubscribe', validateUnsubscribeUser, unsubscribeUserController);

module.exports = router;