//initialize express router
let router = require('express').Router();

//set default API response
router.get('/', function(req, res) {
    res.json({
        status: 'API Works',
        message: 'Welcome to MELI Challenge'
    });
});

//Import  Controllers
var statsController = require('../controllers/statsController');
// trace routes
router.route('/stats').get(statsController.view);
//Export API routes
module.exports = router;