const net = require('net');
var fs = require('fs');
var Commands = require('./nntp/commands.js');
var Response = require('./nntp/response.js');
let Settings;
if (fs.existsSync('./settings.json')) {
    Settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'))
} 

var sockets = [];
var server = net.createServer();
server.on('connection', handleConnection);

function handleConnection(conn) {
    var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
    console.log('[s] ' + 'new client connection from %s', remoteAddress);
    conn.setEncoding('utf8');
    conn.write(Response.code[201]);
    conn.on('data', onConnData);
    conn.once('close', onConnClose);
    conn.on('error', onConnError);

    function onConnData(d) {
        console.log('[c] ' + d.replace("\r\n", ""));
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
                Commands.List(conn);
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

    function onConnClose() {
        console.log('[s] ' + 'connection from %s closed', remoteAddress);
    }

    function onConnError(err) {
        console.log('[s] ' + 'Connection %s error: %s', remoteAddress, err.message);
    }
}
server.listen(Settings.serveradres, Settings.serverport);

console.log('Server Created at ' + Settings.serveradres + ':' + Settings.serverport + '\n');