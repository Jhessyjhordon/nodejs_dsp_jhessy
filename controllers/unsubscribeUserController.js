const userModel = require('../model/UserModel');
const Stripe = require('stripe');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const unsubscribeUserController = async (req, res) => {
    const body = req.body;
    const userId = req.params.id;

    let select = "SELECT subscription, customer, paiement_manager FROM user WHERE id = ?;";
    let updateUser = "UPDATE user SET subscription = 1 WHERE id = ?;";

    let connect = userModel.connection();

    console.log("---->",userId);

    try {
        const decoded = jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET_KEY);

        const [userResult] = await new Promise((resolve, reject) => {
            connect.execute(select, [userId], function (err, selectResult) {
                if (err) {
                    reject(err);
                } else {
                console.log("aaaaaaaa->",selectResult);
                resolve(selectResult);
            }
            });
        });

        if (!userResult || userResult.subscription !== 0) {
            return res.status(409).json({
              message: 'User not subscribed.',
            });
        }

        // Mettre à jour l'abonnement dans Stripe pour se désabonner(le desabonne)
        const canceledSubscription = await stripe.subscriptions.del(userResult.paiement_manager);
        
        // Vérifie que le desabonnement a bien été prise en compte sur Stripe
        if (canceledSubscription.status === 'canceled') {
            // Mettre à jour l'utilisateur dans la base de données
            await new Promise((resolve, reject) => {
                connect.execute(updateUser, [userId], function (err, updateResult) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
            return res.status(200).json({
                message: 'Unsubscribed successfully.',
            });                
        } else {
            // Si l'abonnement n'a pas été annulé correctement dans Stripe
            return res.status(500).json({
                message: 'Failed to cancel subscription in Stripe.',
            });
        }
    } catch (error) {
        return res.status(409).json({
        message: 'Error unsubscribing.',
        });
    }
};

module.exports = unsubscribeUserController;