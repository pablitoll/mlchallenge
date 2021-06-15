class Trace {
    constructor(ip, date, country, iso_code, languages, currency, times, estimated_distance) {

        this.ip = ip;
        this.date = date;
        this.country = country;
        this.iso_code = iso_code;
        this.languages = languages;
        this.currency = currency;
        this.times = times;
        this.estimated_distance = estimated_distance;
        
    }
}

module.exports = Trace;