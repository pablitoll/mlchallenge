let router = require('express').Router();

//set default API response
router.get('/', function(req, res) {
    res.json({
        status: 'API Works',
        message: 'Welcome to MELI Challenge'
    });
});

var traceController = require('../controllers/traceController');
router.route('/trace').post(traceController.add);

module.exports = router;