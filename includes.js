//--------------
// File system
//--------------
const fs = require('fs');

//--------------
// Settings
//--------------
var Settings;
var Driver = require('./database/driver.txt.js');
if (fs.existsSync('./settings.json')) {
    Settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
}
if (fs.existsSync(`./database/driver.${Settings.driver}.js`)) {
    Driver = require(`./database/driver.${Settings.driver}.js`);
}

// #todo
var RFC;
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
var sockets = [];
var server = net.createServer();

var Response = require('./nntp/response');
var Regex = require('./nntp/regex.js');
var Commands = require('./nntp/commands.js');
var Routing = require('./server/routing')

//--------------
// Logging
//--------------
var debug = require('debug');;

var Log = require("./server/logging").Log;
//--------------
// Exports
//--------------
module.exports = {
    fs: fs,
    Settings: Settings,
    Driver: Driver,
    net: net,
    sockets: sockets,
    Response: Response,
    server: server,
    Regex: Regex,
    Commands: Commands,
    RFC: RFC,
    debug: debug,
    Log: Log
}