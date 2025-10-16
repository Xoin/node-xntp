/**
 * NNTP Command Handlers
 * 
 * This module implements handlers for NNTP (Network News Transfer Protocol) commands.
 * Each function corresponds to a specific NNTP command and handles the protocol logic.
 * 
 * Supported commands:
 * - MODE: Set client mode (READER mode)
 * - CAPABILITIES: List server capabilities
 * - LIST: List available newsgroups
 * - GROUP: Select a newsgroup
 * - DATE: Get server date/time
 * - XOVER/OVER: Get article overview information
 * - ARTICLE: Retrieve full article
 * - HEAD: Retrieve article headers only
 */

var fs = require('fs');
var Response = require('./response.js');
var debug = require('debug');
var LogCommands = debug('commands');

// Load settings and database driver
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

/**
 * Handle MODE command
 * Sets the client mode (typically READER for reading articles)
 * 
 * @param {net.Socket} conn - The client connection
 * @param {string} params - Mode parameter (e.g., "READER")
 */
function Mode(conn, params) {
    var Log = LogCommands.extend('reader');
    Log("%o",params)
    if (params == "READER") {
        // 200: Server ready, posting allowed
        conn.write(Response.code[200]);
        Log("%o",Response.code[200])
    }
    else {
        // 201: Server ready, no posting allowed
        conn.write(Response.code[201]);
        Log("%o",Response.code[201])
    }
}
/**
 * Handle LIST command
 * Returns a list of all available newsgroups with their high/low article numbers
 * 
 * @param {net.Socket} conn - The client connection
 * @param {Object} params - Command parameters (not currently used)
 */
function List(conn, params) {
    var Log = LogCommands.extend('list');
    Log("%o",Response.code[215])
    
    // 215: List of newsgroups follows
    conn.write(Response.code[215]);
    
    // Load groups from database and send each one
    groups = Driver.LoadGroups();
    Object.getOwnPropertyNames(groups).forEach(element => {
        // Format: groupname high low high
        conn.write(`${element} ${groups[element]['high']} ${groups[element]['low']} ${groups[element]['high']}\r\n`);
    });
    Log("%O",JSON.stringify(groups))
    
    // End of list marker
    conn.write(".\r\n");
}

/**
 * Handle GROUP command
 * Selects a newsgroup and returns information about it
 * Stores the selected group in the sockets array for the client session
 * 
 * @param {net.Socket} conn - The client connection
 * @param {Object} sockets - Map of client connections to their selected newsgroups
 * @param {Array<string>} params - Command parameters [command, groupname]
 */
function Group(conn, sockets, params) {
    var Log = LogCommands.extend('group');
    Log('Socket: '+JSON.stringify(sockets)+' params:'+JSON.stringify(params));
    groups = Driver.LoadGroups();
    
    if (params.length == 2) {
        // Store selected group for this client
        sockets[conn.remoteAddress + ':' + conn.remotePort] = params[1];
        // Response: 211 high low high groupname
        conn.write('211 ' + groups[params[1]]['high'] + ' 1 ' + groups[params[1]]['high'] + ' ' + params[1] + "\r\n");
        return;
    }
    
    // Check if group exists
    if (!groups.indexOf(params[1])) {
        sockets[conn.remoteAddress + ':' + conn.remotePort] = params[1];
        conn.write('211 ' + groups[params[1]]['high'] + ' ' + groups[params[1]]['low'] + ' ' + groups[params[1]]['high'] + ' ' + params[1] + "\r\n");
    }
    else {
        // 411: No such newsgroup
        conn.write('411 ' + params[1] + ' is unknown')
    }
    Log(Done)
    conn.write(".\r\n");
}

/**
 * Handle DATE command
 * Returns the current server date and time
 * 
 * @param {net.Socket} conn - The client connection
 */
function Date() {
    // 111: Server date and time
    conn.write("111 " + Driver.ConvertDates(Date()) + "  Server date and time\r\n.\r\n");
}

/**
 * Handle XOVER/OVER command
 * Returns overview information for a range of articles
 * Overview data includes headers like subject, from, date, message-id, etc.
 * 
 * @param {net.Socket} conn - The client connection
 * @param {Object} sockets - Map of client connections to their selected newsgroups
 * @param {Array<string>} params - Command parameters [command, range] (e.g., ["XOVER", "1-100"])
 */
function Xover(conn, sockets, params) {
    var Log = LogCommands.extend('xover');
    Log('Socket: '+JSON.stringify(sockets)+' params:'+JSON.stringify(params));
    
    // Check if client has selected a newsgroup
    if (sockets[conn.remoteAddress + ':' + conn.remotePort]) {
        // 224: Overview information follows
        conn.write(Response.code[224]);

        // Parse article range (e.g., "1-100")
        const regex = /([0-9]+)-([0-9]+)/gm;
        let m;
        m = regex.exec(params[1]);
        var datatosend = "";
        
        // Iterate through article range and load headers
        for (let index = parseInt(m[1]); index <= parseInt(m[2]); index++) {
            var article = Driver.LoadHeader(index, sockets[conn.remoteAddress + ':' + conn.remotePort])
            if (article != false) {
                // Append article overview data with line count and byte count
                datatosend += article + '\t0\t0\r\n';
            }
        }
        Log(JSON.stringify(datatosend))
        conn.write(datatosend + '.\r\n');
    }
    else {
        // 412: No newsgroup selected
        Log(Response.code[412])
        conn.write(Response.code[412]);
        conn.write('.\r\n');
    }
}

/**
 * Handle ARTICLE command
 * Retrieves and returns the full article (headers and body)
 * 
 * @param {net.Socket} conn - The client connection
 * @param {Object} sockets - Map of client connections to their selected newsgroups
 * @param {Array<string>} params - Command parameters [command, article-id or number]
 */
function Article(conn,sockets,params) {
    var Log = LogCommands.extend('article');
    Log('Socket: '+JSON.stringify(sockets)+' params:'+JSON.stringify(params));
    
    // Check if client has selected a newsgroup
    if (sockets[conn.remoteAddress + ':' + conn.remotePort]) {
        var article = Driver.LoadArticle(d, sockets[conn.remoteAddress + ':' + conn.remotePort])
        if (article != false) {
            // 220: Article retrieved - head and body follow
            conn.write('220' + params[0] + "\r\n");
            conn.write(article + "\r\n");
            Log(article);
            conn.write(".\r\n");
        }
        else {
            // 430: No such article found
            Log(Response.code[430])
            conn.write(Response.code[430]);
        }
    }
}

/**
 * Handle HEAD command
 * Retrieves and returns only the article headers (not the body)
 * 
 * @param {net.Socket} conn - The client connection
 * @param {Object} sockets - Map of client connections to their selected newsgroups
 * @param {Array<string>} params - Command parameters [command, article-id or number]
 */
function Head(conn,sockets,params) {
    var Log = LogCommands.extend('head');
    Log('Socket: '+JSON.stringify(sockets)+' params:'+JSON.stringify(params));
    
    // Check if client has selected a newsgroup
    if (sockets[conn.remoteAddress + ':' + conn.remotePort]) {
        var article = Driver.LoadArticle(d, sockets[conn.remoteAddress + ':' + conn.remotePort])
        if (article != false) {
            var fine = true;
            // 220: Article retrieved - head follows
            conn.write('220' + params[0] + "\r\n")
            
            // Parse article and send only headers (stop at Message-ID)
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
            // 430: No such article found
            Log(Response.code[430]);
            conn.write(Response.code[430])
        }
    }
}

/**
 * Handle CAPABILITIES command
 * Returns a list of server capabilities and supported commands
 * 
 * @param {net.Socket} conn - The client connection
 */
function Capabilities(conn) {
    var Log = LogCommands.extend('capabilities');
    Log(`${Response.code[101]} ${ValidCommands().join("\r\n")} \r\n.\r\n`);
    // 101: Capability list follows
    conn.write(`${Response.code[101]} ${ValidCommands().join("\r\n")} \r\n.\r\n`);

}

/**
 * Get list of valid NNTP commands supported by this server
 * Extracts command names from exported functions
 * 
 * @returns {Array<string>} Array of uppercase command names
 */
function ValidCommands() {
    return Object.keys(module.exports).splice(1).map(a => a.toUpperCase());
}