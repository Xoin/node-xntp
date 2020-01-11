import incl from './includes';
incl.server.on('connection', handleConnection);
incl.server.listen(incl.Settings.serverport, incl.Settings.serveradres);

LogFallback(`Server Created at ${includes.Settings.serveradres}:${incl.Settings.serverport}`);

function handleConnection(conn) {
    conn.setEncoding('utf8');
    var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
    LogFallback('new client connection from ' + remoteAddress);
    conn.write(incl.Response.code[201]);
    conn.on('data', onData);
    conn.once('close', onClose);
    conn.on('error', onError);

    function onData(d) {
        LogClientData(d.replace("\r\n", ""));
        incl.Commands.Parser(conn, sockets, d.replace("\r\n", ""))
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