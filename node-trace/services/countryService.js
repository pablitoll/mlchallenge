import { RxHR } from "@akanass/rx-http-request";
import { combineLatest, of } from "rxjs";
import { map, mergeMap, catchError } from "rxjs/operators";
const haversine = require("haversine");
let cacheProvider = require("./cacheService");
const { DateTime } = require("luxon");

const coordenadasBSAS = {
  latitude: -33,
  longitude: -64,
};

let coordenadasDestino = {};
//const CACHE_DURATION = 600;
const IP_INFO_PATH = `https://api.ip2country.info/ip?`;
const COUNTRY_INFO_PATH = `https://restcountries.eu/rest/v2/alpha`;
const MONEY_API_KEY = `3ba13f43bf7bde72bf06f409ee7a9689`;
const MONEY_INFO_PATH = `http://data.fixer.io/api/latest?access_key=` + MONEY_API_KEY;
const ERROR_API_IP = `ERR-001`;
const ERROR_API_COUNTRY_DATA = `ERR-002`;
const ERROR_API_COUNTRY_HANDLER = `ERR-005`;
const ERROR_API_CURRENCY = `ERR-003`;
const ERROR_API_CURRENCY_HANDLER = `ERR-004`;


exports.getIpInfo = function (ip) {
  // get country code
  const ipCountryCode$ = ipDataHandler(ip);

  const countryData$ = ipCountryCode$.pipe(
    mergeMap((value) => {
      return countryDataHandler(value.countryCode);
    }),
    catchError((err) => of([ERROR_API_COUNTRY_DATA]))
  );

  const moneyData$ = countryData$.pipe(
    mergeMap((countryData) => {
      return currencyDataHandler(countryData.currencies)
    }),
    catchError((err) => of([ERROR_API_CURRENCY]))
  );

  const observersArray$ = [ipCountryCode$, countryData$, moneyData$, of({ ip })];

  return combineLatest(observersArray$).pipe(mergeMap((value) => { return dataAssembler(value); })
  );
};

/**
 * Ensamblador de datos de los distintos request
 * @param {string} param - response apis
 */

function dataAssembler(param) {
  var trace = new Object();
  trace = initTrace(trace);
  // estos parametros vienen siempre 
  trace.ip = param[3].ip;
  trace.date = DateTime.now().toLocaleString(DateTime.DATE_SHORT) + " " + DateTime.now().toLocaleString(DateTime.TIME_24_WITH_SECONDS);

  // si la api de ip-country esta ok
  if (param[0] != ERROR_API_IP) { trace.iso_code = param[0].countryCode; }


  //si la api de countrydata esta ok
  if (param[0] != ERROR_API_IP && param[1] != ERROR_API_COUNTRY_DATA && param[1] != ERROR_API_COUNTRY_HANDLER) {
    trace.country = param[1].nativeName + " (" + param[0].countryName + ")";
    trace.languages = languagesHandler(param[1].languages);
    trace.times = timezoneHandler(param[1].timezones);
    coordenadasDestino.latitude = param[1].latlng[0];
    coordenadasDestino.longitude = param[1].latlng[1];
    const distance = Math.round(haversine(coordenadasBSAS, coordenadasDestino));
    trace.estimated_distance = distance + " kms";
    trace.estimated_distance_value = distance;
  }
  // si la api de currency esta ok
  if (param[2] != ERROR_API_CURRENCY & param[2] != ERROR_API_CURRENCY_HANDLER && param[1] != ERROR_API_COUNTRY_DATA && param[1] != ERROR_API_COUNTRY_HANDLER) {
    trace.currency = currencyHandler(param[2], param[1].currencies);
  }

  return of(trace);
}


/**
 * Busca la informacion del pais asociada a la IP
 * @param {string} ip - direccion ip v4
 */

function ipDataHandler(ip) {
  const ipEndpoint = `${IP_INFO_PATH}${ip}`;
  const value = cacheProvider.instance().get(ipEndpoint);
  let data$;
  if (value == undefined) {
    data$ = RxHR.get(ipEndpoint, { json: true }).pipe(
      map(response => { return response.body }),
      catchError((err) => of([ERROR_API_IP]))
    );
  } else {
    data$ = of(value);
  }
  // cache subscribers
  data$.subscribe((value) => cacheProvider.instance().set(ipEndpoint, value));
  return data$;
}

/**
 * Busca la informacion del pais asociada un codigo de pais
 * @param {string} ip - direccion ip v4
 */
function countryDataHandler(countryCode) {
  let countryEndpoint = `${COUNTRY_INFO_PATH}/${countryCode}`;
  let Data$ = of("");
  const value = cacheProvider.instance().get(countryEndpoint);
  if (value == undefined) {
    Data$ = RxHR.get(countryEndpoint, { json: true }).pipe(
      map((response) => response.body),
      catchError((err) => of([ERROR_API_COUNTRY_HANDLER])));
  } else {
    Data$ = of(value);
  }
  Data$.subscribe((value) => cacheProvider.instance().set(countryEndpoint, value));
  return Data$;
}


/**
 * Busca la informacion de la moneda asociada un codigo de pais
 * para evitar llamadas innecesarias (y q se me bloquee el api key)
 * hago una peticion para todas las monedas y las guardo en el cache
 * @param {string} currencies - 
 */
function currencyDataHandler(currencies) {

  let currencyEndpoint = `${MONEY_INFO_PATH}`;
  let Data$ = of("");
  const value = cacheProvider.instance().get(currencyEndpoint);
  if (value == undefined) {
    Data$ = RxHR.get(currencyEndpoint, { json: true, }).pipe(
      map((response) => response.body),
      catchError((err) => of([ERROR_API_CURRENCY_HANDLER])));
  } else {
    Data$ = of(value);
  }
  Data$.subscribe((value) => {
    cacheProvider.instance().set(currencyEndpoint, value)
  });
  return Data$;
}
/**
 * Formatea el array de idiomas segun lo requerido
 * @param {string} params - array de idiomas
 */
function languagesHandler(params) {
  let languagesArray = [];
  params.forEach((language) => {
    languagesArray.push(language.nativeName + " (" + language.iso639_1 + ")")
  })
  return languagesArray;
}

/**
 * Formatea el array de mondedas segun lo requerido
 * @param {string} currenciesValues - array de monedas con sus valores
 * @param {string} currencies - array de monedas de curso legal del pais
 */
function currencyHandler(currenciesValues, currencies) {
  let currencyArray = [];
  currencies.forEach(currency => {
    for (var key in currenciesValues.rates) {
      if (currency.code == key) {
        var val = currenciesValues.rates[key];
        currencyArray.push(currenciesValues.base + " (1 " + currenciesValues.base + " = " + val + " " + key + ")");
      }
    }
  });
  return currencyArray;
}
/**
 * Formatea el array de usos horarios
 * @param {string} cursosHorarios - array de cursos horarios
 */
function timezoneHandler(cursosHorarios) {
  let timeNow = DateTime.now();
  let timezoneResponseArray = [];
  cursosHorarios.forEach((timeOffset) => {
    timezoneResponseArray.push(
      timeNow.setZone(timeOffset)
        .toLocaleString(DateTime.TIME_24_WITH_SECONDS) + "(" + timeOffset + ")");
  });
  return timezoneResponseArray;
}

function initTrace(trace) {
  trace.ip = "";
  trace.date = "";
  trace.country = "";
  trace.iso_code = "";
  trace.languages = "";
  trace.currency = "";
  trace.times = "";
  trace.estimated_distance = "";
  trace.estimated_distance_value = "";
  return trace;

}