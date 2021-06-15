let MQService = require('./services/MQService')
let statsService = require('./services/statsService')
let cacheProvider = require('./services/cacheService')
const Stats = require('./models/statsModel')
const express = require("express");
const app = express();
const STATS_KEY = "STATS"
// setup cache
cacheProvider.start(function (err) {
    if (err) { console.error(err) }
})
newStats = new Stats(0, 99999, 0, 0);
cacheProvider.instance().set(STATS_KEY, newStats)

MQService.getInstance()
    .then(async (mq) => {
        mq.subscribe('melichallengetrace', async (msg, ack) => {
            let trace = JSON.parse(msg.content.toString());
            let process = statsService.statsProcess(trace);
            process.then(async (trace) => {
                await mq.send('melichallengestats', Buffer.from(JSON.stringify(trace)));
                ack()
            }
            ).catch(console.log);
        })
    })

// agrego el reset solo para poder probar
app.listen(3002, () => {
    console.log("procesador escuchando en el puerto 3002");
});

app.post('/v1/proc/reset', function (req, res) {
    newStats = new Stats(0, 99999, 0, 0);
    cacheProvider.instance().set(STATS_KEY, newStats)
    res.send('reset ok');
});