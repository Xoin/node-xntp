const fs = require('fs');
let Settings;
let Driver = require(`../database/driver.txt.js`);
if (fs.existsSync('./settings.json')) {
    Settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
}
if (fs.existsSync(`../database/driver.${Settings.driver}.js`)) {
    Driver = require(`../database/driver.${Settings.driver}.js`);
}

// #todo
let RFC = 3977;
if (Settings["RFC"]["977"]) {
    RFC = 977;
}
else if (Settings["RFC"]["3977"]) {
    RFC = 3977;
}
else {
    RFC = 3977;
}

module.exports = {
    Settings: Settings,
    Driver: Driver,
    RFC: RFC
}