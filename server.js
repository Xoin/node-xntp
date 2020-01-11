var Core = require('./includes');
Core.server.on('connection', handleConnection);
Core.server.listen(Core.Settings.serverport, Core.Settings.serveradres);

Core.Log("server", `Server Created at ${Core.Settings.serveradres}:${Core.Settings.serverport}`);

function handleConnection(conn) {
    conn.setEncoding('utf8');
    var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
    Core.Log("server", 'new client connection from ' + remoteAddress);
    conn.write(Core.Response.Message(201));
    conn.on('data', onData);
    conn.once('close', onClose);
    conn.on('error', onError);

    function onData(d) {
        Core.Log("server", d.replace("\r\n", ""));
        Core.Commands.Parser(conn, sockets, d.replace("\r\n", ""))
    }

    function onClose() {
        Core.Log("server", `connection from ${remoteAddress} closed`);
    }

    function onError(err) {
        Core.Log("server", `Connection ${remoteAddress} error: ${err.message}`);
    }
}

