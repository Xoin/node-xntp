var Core = require('./includes');
Core.server.on('connection', handleConnection);


Core.server.listen(Core.Settings.serverport, Core.Settings.serveradres);

Core.Log("server", `Server Created at ${Core.Settings.serveradres}:${Core.Settings.serverport}`);

function handleConnection(conn) {
    conn.setEncoding('utf8');
    var ConnData = new Core.Routing.Meta(conn.remoteAddress, conn.remotePort)
    Core.Log("server", 'new client connection from ' + ConnData.ip);
    Core.Routing.ConnectionAdd(ConnData, conn);
    Core.Routing.Send(ConnData, Core.Response.Message(201));

    conn.on('data', onData);
    conn.once('close', onClose);
    conn.on('error', onError);

    function onData(data) {
        Core.Log("server", data.replace("\r\n", ""));
        Core.Commands.Parser(ConnData, data.replace("\r\n", ""))
    }

    function onClose() {
        Core.Log("server", `connection from ${remoteAddress} closed`);
    }

    function onError(err) {
        Core.Log("server", `Connection ${remoteAddress} error: ${err.message}`);
    }
}