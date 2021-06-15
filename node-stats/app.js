let express = require('express')
let cacheProvider = require('./services/cacheService')
let MQService = require('./services/MQService')
const STATS_KEY = "STATS"

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
var port = 3001;
//Use API routes in the App
app.use('/v1', apiRoutes)

// Launch app to the specified port
app.listen(port, function () {
    console.log("Running MELI Challenge Stats on Port " + port);
});

MQService.getInstance()
    .then(mq => {
        mq.subscribe('melichallengestats', (msg, ack) => {
            cacheProvider.instance().set(STATS_KEY,JSON.parse(msg.content.toString()));
            ack()
        })
    })