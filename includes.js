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
else if (Settings["RFC"]["2980"]) {
    RFC = 2980;
}
else if (Settings["RFC"]["3977"]) {
    RFC = 3977;
}
else if (Settings["RFC"]["4642"]) {
    RFC = 4642;
}
else if (Settings["RFC"]["4643"]) {
    RFC = 4643;
}
else if (Settings["RFC"]["4644"]) {
    RFC = 4644;
}
else if (Settings["RFC"]["6048"]) {
    RFC = 6048;
}
else if (Settings["RFC"]["8143"]) {
    RFC = 8143;
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

var Response = require('./nntp/response.js');
var Regex = require('./nntp/regex.js');
var Commands = require('./nntp/commands.js');

//--------------
// Logging
//--------------
var debug = require('debug');
var LogCommands = debug('commands');
var LogServer = debug('server');
var LogClientData = LogServer.extend('client data');
var LogDriver = debug('driver');

module.exports = {
    fs: fs,
    Settings: Settings,
    Driver: Driver,
    net: net,
    sockets: sockets,
    server: server,
    Response: Response,
    Regex: Regex,
    Commands: Commands,
    debug: debug,
    LogCommands: LogCommands,
    LogServer: LogServer,
    LogClientData: LogClientData,
    LogDriver: LogDriver,
    RFC: RFC
}