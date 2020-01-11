function Xover(conn, sockets, params) {
    var Log = LogCommands.extend('xover');
    Log('Socket: ' + JSON.stringify(sockets) + ' params:' + JSON.stringify(params));
    if (sockets[conn.remoteAddress + ':' + conn.remotePort]) {
        conn.write(Response.code[3977][224]);

        const regex = /([0-9]+)-([0-9]+)/gm;
        let m;
        m = regex.exec(params[1]);
        var datatosend = "";
        for (let index = parseInt(m[1]); index <= parseInt(m[2]); index++) {
            var article = Driver.LoadHeader(index, sockets[conn.remoteAddress + ':' + conn.remotePort])
            if (article != false) {
                datatosend += article + '\t0\t0\r\n';
            }
        }
        Log(JSON.stringify(datatosend))
        conn.write(datatosend + '.\r\n');
    }
    else {
        Log(Response.code[3977][412])
        conn.write(Response.code[3977][412]);
        conn.write('.\r\n');
    }
}