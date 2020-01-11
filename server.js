const net = require('net');
var fs = require('fs');
var Commands = require('./nntp/commands.js');
var Response = require('./nntp/response.js');
var debug = require('debug');
var LogServer = debug('server');
var LogClientData = LogServer.extend('client data');

let Settings;
if (fs.existsSync('./settings.json')) {
    Settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'))
}

var sockets = [];
var server = net.createServer();
server.on('connection', handleConnection);
server.listen(Settings.serverport, Settings.serveradres);

LogFallback(`Server Created at ${Settings.serveradres}:${Settings.serverport}`);

function handleConnection(conn) {
    conn.setEncoding('utf8');
    var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
    LogFallback('new client connection from ' + remoteAddress);
    conn.write(Response.code[201]);
    conn.on('data', onData);
    conn.once('close', onClose);
    conn.on('error', onError);
    
    function onData(d) {
        LogClientData(d.replace("\r\n", ""));
        var temp = d.replace("\r\n", "").split(" ");

        if (!Commands.ValidCommands().includes(temp[0])) {
        }
        switch (temp[0]) {
            case "CAPABILITIES":
                Commands.Capabilities(conn);
                break;
            case "MODE":
                Commands.Mode(conn, temp[1]);
                break;
            case "LIST":
                Commands.List(conn, sockets);
                break;
            case "GROUP":
                Commands.Group(conn, sockets, temp);
                break;
            case "DATE":
                Commands.Date(conn);
                break;
            case "OVER":
            case "XOVER":
                Commands.Xover(conn, sockets, temp);
                break;
            case "ARTICLE":
                Commands.Article(conn, sockets, temp);
                break;
            case "HEAD":
                Commands.Head(conn, sockets, temp);
                break;
            default:
                break;
        }
    }

    function onClose() {
        LogFallback(`connection from ${remoteAddress} closed`);
    }

    function onError(err) {
        LogFallback(`Connection ${remoteAddress} error: ${err.message}`);
    }
}

function LogFallback(params) {
    if (LogServer.enabled) {
        LogServer(params);
    } else {
        console.log("[s] " + params);
    }
}