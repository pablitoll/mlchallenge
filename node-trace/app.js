let express = require('express')
let cacheProvider = require('./services/cacheService')
let app = express();
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

//Import routes
let apiRoutes = require("./routes/routes")
//Use API routes in the App
app.use('/v1', apiRoutes)

// setup cache
cacheProvider.start(function (err) {
    if (err) { console.error(err) }
})

// Server Port
var port = 3000;

// Launch app to the specified port
app.listen(port, function () {
    console.log("Running MELI Challenge TRACE on Port " + port);
});