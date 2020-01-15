//--------------
// File system
//--------------
const fs = require('fs');

//--------------
// Settings
//--------------
let Settings;
let Driver = require('./database/driver.txt.js');
if (fs.existsSync('./settings.json')) {
    Settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
}
if (fs.existsSync(`./database/driver.${Settings.driver}.js`)) {
    Driver = require(`./database/driver.${Settings.driver}.js`);
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

//--------------
// Server
//--------------
const net = require('net');
const server = net.createServer();
const Regex = require('./nntp/regex.js');
const Commands = require('./nntp/commands.js');
const Response = require('./nntp/response');
const Routing = require('./server/routing')

//--------------
// Logging
//--------------
const debug = require('debug');

const Log = require("./server/logging").Log;
//--------------
// Exports
//--------------
module.exports = {
    fs: fs,
    Settings: Settings,
    Driver: Driver,
    net: net,
    Routing: Routing,
    Response: Response,
    server: server,
    Regex: Regex,
    Commands: Commands,
    RFC: RFC,
    debug: debug,
    Log: Log
}