var net = require("net");
const Trace = require("../models/traceModel");
let countryProvider = require('../services/countryService')
let MQService = require("../services/MQService");
exports.add = function (req, res) {
    const ip = req.body.ip;
    // ip check 
    if (!net.isIP(ip)) {
        return res.status(400).send({
            error: "bad ip format"
        })
    }
    let response$ = countryProvider.getIpInfo(req.body.ip);
    response$.subscribe(async (result) => {
        const mq = await MQService.getInstance();
        //console.log ( Date.now() + " --> " + JSON.stringify(result));
         mq.send('melichallengetrace', Buffer.from(JSON.stringify(result)));
        const respTrace = new Trace(
            result.ip,
            result.date,
            result.country,
            result.iso_code,
            result.languages,
            result.currency,
            result.times,
            result.estimated_distance
        );
        return res.json(respTrace);
    });
};



