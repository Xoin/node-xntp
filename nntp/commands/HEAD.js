function Head(conn, sockets, params) {
    var Log = LogCommands.extend('head');
    Log('Socket: ' + JSON.stringify(sockets) + ' params:' + JSON.stringify(params));
    if (sockets[conn.remoteAddress + ':' + conn.remotePort]) {
        var article = Driver.LoadArticle(d, sockets[conn.remoteAddress + ':' + conn.remotePort])
        if (article != false) {
            var fine = true;
            conn.write('220' + params[0] + "\r\n")
            article.split('\r\n').forEach(element => {
                if (fine = true) {
                    if (element.includes('Message-ID:')) {
                        fine = false
                    }
                    else {
                        conn.write(element + "\r\n")
                    }

                }

            });
            Log('Socket: ' + JSON.stringify(sockets) + ' params:' + JSON.stringify(params));
            conn.write(".\r\n")
        }
        else {
            Log(Response.code[3977][430]);
            conn.write(Response.code[3977][430])
        }
    }
}