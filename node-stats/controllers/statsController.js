let cacheProvider = require('../services/cacheService');
const STATS_KEY = "STATS"
exports.view = function (req, res) {
    let currentStat = cacheProvider.instance().get(STATS_KEY);
    let stat = new Object();

    if (currentStat != undefined) {
        stat.distanciaMaxima = currentStat.distanciaMaxima;
        stat.distanciaMinima = currentStat.distanciaMinima;
        stat.distanciaPromedio = currentStat.distanciaPromedio;
    }
    return res.json(stat);
};



