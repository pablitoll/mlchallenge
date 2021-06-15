let cacheProvider = require("../services/cacheService");
Stats = require('../models/statsModel');
const STATS_KEY = "STATS"

module.exports.statsProcess = function (trace) {
    return new Promise((resolve, reject) => {

        // obtengo la estadistica del cache
        const currentStats = (cacheProvider.instance().get(STATS_KEY));
        // actualizo los datos de la estadistica
        const newStats = calcularNewStats(currentStats, trace)
        // cache througth
        // actualiza estadistica en cache
        // actualiza estadistica en DB
        cacheProvider.instance().set(STATS_KEY, newStats)
        resolve(newStats);
    })
};


function calcularNewStats(currentStats, trace) {

    //ACTUALIZO LOS HITS
    currentStats.hits++;
    //CALCULO DE DISTANCIA PROMEDIO
    let newAcumuladoKM = (currentStats.kilometrosAcumulados + trace.estimated_distance_value)
    let promedio = Math.round(newAcumuladoKM / currentStats.hits);
    let newdistanciaMaxima = 0;
    let newdistanciaMinima = 0;

    //CALCULO DISTANCIA MAXIMA
    if (currentStats.distanciaMaxima < trace.estimated_distance_value) {
        newdistanciaMaxima = trace.estimated_distance_value
    }
    else { newdistanciaMaxima = currentStats.distanciaMaxima }

    //CALCULO DISTANCIA MINIMA
    if (trace.estimated_distance_value < currentStats.distanciaMinima) {
        newdistanciaMinima = trace.estimated_distance_value
    }
    else { newdistanciaMinima = currentStats.distanciaMinima }

    currentStats.distanciaPromedio = promedio;
    currentStats.kilometrosAcumulados = newAcumuladoKM;
    currentStats.distanciaMaxima = newdistanciaMaxima;
    currentStats.distanciaMinima = newdistanciaMinima;
    return currentStats;
}
