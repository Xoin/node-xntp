var Core = require('../../includes');

function Help(params) {
    switch (Core.RFC) {
        case 977:

            break;
        case 3977:

            break;
        default:
            break;
    }
}

function Article(conn, sockets, params) {
    var Log = LogCommands.extend('article');
    Log('Socket: ' + JSON.stringify(sockets) + ' params:' + JSON.stringify(params));
    if (sockets[conn.remoteAddress + ':' + conn.remotePort]) {
        var article = Driver.LoadArticle(d, sockets[conn.remoteAddress + ':' + conn.remotePort])
        if (article != false) {
            conn.write('220' + params[0] + "\r\n");
            conn.write(article + "\r\n");
            Log(article);
            conn.write(".\r\n");
        }
        else {
            Log(Response.code[3977][430])
            conn.write(Response.code[3977][430]);
        }
    }
}