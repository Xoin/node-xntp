var fs = require('fs');
var Response = require('./response.js');
var debug = require('debug');
var LogCommands = debug('commands');

let Settings;
let Driver = require('../database/driver.txt.js');
if (fs.existsSync('./settings.json')) {
    Settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
}
if (fs.existsSync(`../database/driver.${Settings.driver}.js`)) {
    Driver = require(`../database/driver.${Settings.driver}.js`);
}

module.exports = {
    ValidCommands,
    Mode,
    Capabilities,
    Article,
    List,
    Group,
    Date,
    Xover,
    Head
};

function Mode(conn, params) {
    var Log = LogCommands.extend('reader');
    Log("%o",params)
    if (params == "READER") {
        conn.write(Response.code[200]);
        Log("%o",Response.code[200])
    }
    else {
        conn.write(Response.code[201]);
        Log("%o",Response.code[201])
    }
}
function List(conn, params) {
    var Log = LogCommands.extend('list');
    Log("%o",Response.code[215])
    conn.write(Response.code[215]);
    groups = Driver.LoadGroups();
    Object.getOwnPropertyNames(groups).forEach(element => {
        conn.write(`${element} ${groups[element]['high']} ${groups[element]['low']} ${groups[element]['high']}\r\n`);
    });
    Log("%O",JSON.stringify(groups))
    conn.write(".\r\n");
}

function Group(conn, sockets, params) {
    var Log = LogCommands.extend('group');
    Log('Socket: '+JSON.stringify(sockets)+' params:'+JSON.stringify(params));
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

function Date() {
    conn.write("111 " + Driver.ConvertDates(Date()) + "  Server date and time\r\n.\r\n");
}

function Xover(conn, sockets, params) {
    var Log = LogCommands.extend('xover');
    Log('Socket: '+JSON.stringify(sockets)+' params:'+JSON.stringify(params));
    if (sockets[conn.remoteAddress + ':' + conn.remotePort]) {
        conn.write(Response.code[224]);

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
        Log(Response.code[412])
        conn.write(Response.code[412]);
        conn.write('.\r\n');
    }
}

function Article(conn,sockets,params) {
    var Log = LogCommands.extend('article');
    Log('Socket: '+JSON.stringify(sockets)+' params:'+JSON.stringify(params));
    if (sockets[conn.remoteAddress + ':' + conn.remotePort]) {
        var article = Driver.LoadArticle(d, sockets[conn.remoteAddress + ':' + conn.remotePort])
        if (article != false) {
            conn.write('220' + params[0] + "\r\n");
            conn.write(article + "\r\n");
            Log(article);
            conn.write(".\r\n");
        }
        else {
            Log(Response.code[430])
            conn.write(Response.code[430]);
        }
    }
}

function Head(conn,sockets,params) {
    var Log = LogCommands.extend('head');
    Log('Socket: '+JSON.stringify(sockets)+' params:'+JSON.stringify(params));
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
            Log('Socket: '+JSON.stringify(sockets)+' params:'+JSON.stringify(params));
            conn.write(".\r\n")
        }
        else {
            Log(Response.code[430]);
            conn.write(Response.code[430])
        }
    }
}

function Capabilities(conn) {
    var Log = LogCommands.extend('capabilities');
    Log(`${Response.code[101]} ${ValidCommands().join("\r\n")} \r\n.\r\n`);
    conn.write(`${Response.code[101]} ${ValidCommands().join("\r\n")} \r\n.\r\n`);

}

function ValidCommands() {
    return Object.keys(module.exports).splice(1).map(a => a.toUpperCase());
}