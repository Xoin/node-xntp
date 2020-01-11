function Group(conn, sockets, params) {
    var Log = LogCommands.extend('group');
    Log('Socket: ' + JSON.stringify(sockets) + ' params:' + JSON.stringify(params));
    groups = Driver.LoadGroups();
    if (params.length == 2) {
        sockets[conn.remoteAddress + ':' + conn.remotePort] = params[1];
        conn.write('211 ' + groups[params[1]]['high'] + ' 1 ' + groups[params[1]]['high'] + ' ' + params[1] + "\r\n");
        return;
    }
    if (!groups.indexOf(params[1])) {
        sockets[conn.remoteAddress + ':' + conn.remotePort] = params[1];
        conn.write('211 ' + groups[params[1]]['high'] + ' ' + groups[params[1]]['low'] + ' ' + groups[params[1]]['high'] + ' ' + params[1] + "\r\n");
    }
    else {
        conn.write('411 ' + params[1] + ' is unknown')
    }
    Log(Done)
    conn.write(".\r\n");
}