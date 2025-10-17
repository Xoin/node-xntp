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
    Body,
    Head,
    Stat,
    List,
    Group,
    DateCommand,
    Xover,
    Help,
    Quit,
    Next,
    Last,
    Newgroups,
    Newnews,
    Post,
    Ihave,
    Slave,
    Listgroup,
    Hdr
};

/**
 * Handle MODE command
 * Sets the client mode (typically READER for reading articles)
 * 
 * @param {net.Socket} conn - The client connection
 * @param {string} params - Mode parameter (e.g., "READER")
 */
function Mode(conn, params) {
    var Log = LogCommands.extend('mode');
    Log("%o",params)
    
    if (params && params.toUpperCase() == "READER") {
        // RFC 3977: 200 means posting is allowed, 201 means posting not allowed
        // For now, we don't allow posting
        conn.write(Response.code[201]);
        Log("%o",Response.code[201])
    }
    else {
        // Invalid mode or no mode specified
        conn.write(Response.code[501]);
        Log("Invalid MODE parameter")
    }
}
/**
 * Handle LIST command
 * Returns a list of all available newsgroups with their high/low article numbers
 * RFC 3977 adds support for LIST variants: ACTIVE, NEWSGROUPS, OVERVIEW.FMT
 * 
 * @param {net.Socket} conn - The client connection
 * @param {Object} params - Command parameters
 * @param {Array<string>} temp - Full command array [command, variant, wildmat]
 */
function List(conn, params, temp) {
    var Log = LogCommands.extend('list');
    
    // Determine which LIST variant to use
    var variant = temp[1] ? temp[1].toUpperCase() : 'ACTIVE';
    var wildmat = temp[2] || '*';
    
    Log('LIST variant: ' + variant);
    
    switch(variant) {
        case 'ACTIVE':
        case 'ACTIVE.TIMES':
            // 215: List of newsgroups follows
            conn.write(Response.code[215]);
            
            // Load groups from database and send each one
            groups = Driver.LoadGroups();
            Object.getOwnPropertyNames(groups).forEach(element => {
                // Skip non-group entries
                if (!groups[element].high || !groups[element].low) {
                    return;
                }
                // Format: groupname high low status
                // Status: y = posting allowed, n = no posting, m = moderated
                conn.write(`${element} ${groups[element]['high']} ${groups[element]['low']} n\r\n`);
            });
            Log("%O",JSON.stringify(groups))
            
            // End of list marker
            conn.write(".\r\n");
            break;
            
        case 'NEWSGROUPS':
            // 215: List of newsgroups follows (with descriptions)
            conn.write(Response.code[215]);
            
            groups = Driver.LoadGroups();
            Object.getOwnPropertyNames(groups).forEach(element => {
                // Skip non-group entries
                if (!groups[element].high || !groups[element].low) {
                    return;
                }
                // Format: groupname description
                conn.write(`${element} ${element} newsgroup\r\n`);
            });
            
            conn.write(".\r\n");
            Log("LIST NEWSGROUPS sent");
            break;
            
        case 'OVERVIEW.FMT':
            // 215: Information follows
            conn.write(Response.code[215]);
            
            // RFC 3977 standard overview format
            conn.write("Subject:\r\n");
            conn.write("From:\r\n");
            conn.write("Date:\r\n");
            conn.write("Message-ID:\r\n");
            conn.write("References:\r\n");
            conn.write(":bytes\r\n");
            conn.write(":lines\r\n");
            
            conn.write(".\r\n");
            Log("LIST OVERVIEW.FMT sent");
            break;
            
        default:
            // Backward compatibility - no variant specified
            if (!temp[1]) {
                // Default to ACTIVE
                conn.write(Response.code[215]);
                
                groups = Driver.LoadGroups();
                Object.getOwnPropertyNames(groups).forEach(element => {
                    // Skip non-group entries
                    if (!groups[element].high || !groups[element].low) {
                        return;
                    }
                    // RFC 977 format: groupname high low high
                    conn.write(`${element} ${groups[element]['high']} ${groups[element]['low']} ${groups[element]['high']}\r\n`);
                });
                
                conn.write(".\r\n");
            } else {
                // Unknown LIST variant
                conn.write(Response.code[501]);
            }
            break;
    }
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
 * Returns the current server date and time in RFC 3977 format (YYYYMMDDHHMMSS)
 * 
 * @param {net.Socket} conn - The client connection
 */
function DateCommand(conn) {
    var Log = LogCommands.extend('date');
    // Get current date and format as YYYYMMDDHHMMSS
    var now = new Date();
    var dateStr = now.getUTCFullYear() + 
                  String(now.getUTCMonth() + 1).padStart(2, '0') +
                  String(now.getUTCDate()).padStart(2, '0') +
                  String(now.getUTCHours()).padStart(2, '0') +
                  String(now.getUTCMinutes()).padStart(2, '0') +
                  String(now.getUTCSeconds()).padStart(2, '0');
    // 111: Server date and time
    conn.write("111 " + dateStr + "\r\n");
    Log("111 " + dateStr);
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
    if (!sockets[conn.remoteAddress + ':' + conn.remotePort]) {
        conn.write(Response.code[412]);
        Log("No newsgroup selected");
        return;
    }
    
    // 224: Overview information follows
    conn.write(Response.code[224]);

    // Parse article range (e.g., "1-100")
    if (params[1]) {
        const regex = /([0-9]+)-([0-9]+)/gm;
        let m = regex.exec(params[1]);
        
        if (m) {
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
            conn.write(datatosend);
        }
    }
    
    conn.write('.\r\n');
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
        var article = Driver.LoadArticle(params[1], sockets[conn.remoteAddress + ':' + conn.remotePort])
        if (article != false) {
            // 220: Article retrieved - head and body follow
            conn.write('220 ' + params[1] + "\r\n");
            conn.write(article);
            Log(article);
            conn.write(".\r\n");
        }
        else {
            // 430: No such article found
            Log(Response.code[430])
            conn.write(Response.code[430]);
        }
    }
    else {
        // 412: No newsgroup selected
        Log(Response.code[412])
        conn.write(Response.code[412]);
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
        var article = Driver.LoadArticle(params[1], sockets[conn.remoteAddress + ':' + conn.remotePort])
        if (article != false) {
            // 221: Article retrieved - head follows
            conn.write('221 ' + params[1] + "\r\n");
            
            // Parse article and send only headers (stop at blank line separating headers from body)
            var lines = article.split('\r\n');
            for (var i = 0; i < lines.length; i++) {
                if (lines[i] === '') {
                    // Empty line marks end of headers
                    break;
                }
                conn.write(lines[i] + "\r\n");
            }
            
            Log('Headers sent for article: '+params[1]);
            conn.write(".\r\n");
        }
        else {
            // 430: No such article found
            Log(Response.code[430]);
            conn.write(Response.code[430])
        }
    }
    else {
        // 412: No newsgroup selected
        Log(Response.code[412]);
        conn.write(Response.code[412]);
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
    
    // 101: Capability list follows
    conn.write(Response.code[101]);
    
    // Report version based on RFC mode
    if (Settings.RFC["3977"]) {
        conn.write("VERSION 2\r\n");
    } else {
        conn.write("VERSION 1\r\n");
    }
    
    // Report implementation details
    conn.write("IMPLEMENTATION node-xntp\r\n");
    
    // Report supported commands based on RFC mode
    conn.write("READER\r\n");
    
    // RFC 3977 specific capabilities
    if (Settings.RFC["3977"]) {
        conn.write("HDR\r\n");
        conn.write("OVER\r\n");
        conn.write("LIST ACTIVE NEWSGROUPS OVERVIEW.FMT\r\n");
    }
    
    // RFC 977 capabilities
    if (Settings.RFC["977"]) {
        conn.write("XOVER\r\n");
    }
    
    conn.write(".\r\n");
    Log("Capabilities sent");
}

/**
 * Handle HELP command
 * Returns a list of available commands
 * 
 * @param {net.Socket} conn - The client connection
 */
function Help(conn) {
    var Log = LogCommands.extend('help');
    // 100: Help text follows
    conn.write(Response.code[100]);
    conn.write("Supported commands:\r\n");
    ValidCommands().forEach(cmd => {
        conn.write("  " + cmd + "\r\n");
    });
    conn.write(".\r\n");
    Log("Help sent");
}

/**
 * Handle QUIT command
 * Close the connection gracefully
 * 
 * @param {net.Socket} conn - The client connection
 */
function Quit(conn) {
    var Log = LogCommands.extend('quit');
    // 205: Closing connection
    conn.write(Response.code[205]);
    Log("Connection closed");
    conn.end();
}

/**
 * Handle BODY command
 * Returns only the body of an article (without headers)
 * 
 * @param {net.Socket} conn - The client connection
 * @param {Object} sockets - Map of client connections to their selected newsgroups
 * @param {Array<string>} params - Command parameters [command, article-id or number]
 */
function Body(conn, sockets, params) {
    var Log = LogCommands.extend('body');
    Log('Socket: '+JSON.stringify(sockets)+' params:'+JSON.stringify(params));
    
    // Check if client has selected a newsgroup
    if (sockets[conn.remoteAddress + ':' + conn.remotePort]) {
        var article = Driver.LoadArticle(params[1], sockets[conn.remoteAddress + ':' + conn.remotePort])
        if (article != false) {
            // 222: Article retrieved - body follows
            conn.write('222 ' + params[1] + "\r\n");
            
            // Parse article and send only body (skip headers)
            var lines = article.split('\r\n');
            var inBody = false;
            for (var i = 0; i < lines.length; i++) {
                if (inBody) {
                    conn.write(lines[i] + "\r\n");
                } else if (lines[i] === '') {
                    // Empty line marks start of body
                    inBody = true;
                }
            }
            
            Log('Body sent for article: '+params[1]);
            conn.write(".\r\n");
        }
        else {
            // 430: No such article found
            Log(Response.code[430]);
            conn.write(Response.code[430]);
        }
    }
    else {
        // 412: No newsgroup selected
        Log(Response.code[412]);
        conn.write(Response.code[412]);
    }
}

/**
 * Handle STAT command
 * Returns the status of an article without retrieving its text
 * 
 * @param {net.Socket} conn - The client connection
 * @param {Object} sockets - Map of client connections to their selected newsgroups
 * @param {Array<string>} params - Command parameters [command, article-id or number]
 */
function Stat(conn, sockets, params) {
    var Log = LogCommands.extend('stat');
    Log('Socket: '+JSON.stringify(sockets)+' params:'+JSON.stringify(params));
    
    // Check if client has selected a newsgroup
    if (sockets[conn.remoteAddress + ':' + conn.remotePort]) {
        var article = Driver.LoadArticle(params[1], sockets[conn.remoteAddress + ':' + conn.remotePort])
        if (article != false) {
            // 223: Article exists
            conn.write('223 ' + params[1] + "\r\n");
            Log('Article exists: '+params[1]);
        }
        else {
            // 430: No such article found
            Log(Response.code[430]);
            conn.write(Response.code[430]);
        }
    }
    else {
        // 412: No newsgroup selected
        Log(Response.code[412]);
        conn.write(Response.code[412]);
    }
}

/**
 * Handle NEXT command
 * Move to the next article in the current newsgroup
 * 
 * @param {net.Socket} conn - The client connection
 * @param {Object} sockets - Map of client connections to their selected newsgroups
 */
function Next(conn, sockets) {
    var Log = LogCommands.extend('next');
    // Not fully implemented - placeholder
    // 421: No next article in this group
    conn.write(Response.code[421]);
    Log("NEXT command not fully implemented");
}

/**
 * Handle LAST command
 * Move to the previous article in the current newsgroup
 * 
 * @param {net.Socket} conn - The client connection
 * @param {Object} sockets - Map of client connections to their selected newsgroups
 */
function Last(conn, sockets) {
    var Log = LogCommands.extend('last');
    // Not fully implemented - placeholder
    // 422: No previous article in this group
    conn.write(Response.code[422]);
    Log("LAST command not fully implemented");
}

/**
 * Handle NEWGROUPS command
 * List new newsgroups created since a specified date
 * 
 * @param {net.Socket} conn - The client connection
 * @param {Array<string>} params - Command parameters [command, date, time, GMT]
 */
function Newgroups(conn, params) {
    var Log = LogCommands.extend('newgroups');
    // 231: List of new newsgroups follows
    conn.write(Response.code[231]);
    // Not fully implemented - no new groups to report
    conn.write(".\r\n");
    Log("NEWGROUPS command - no new groups");
}

/**
 * Handle NEWNEWS command
 * List new articles since a specified date
 * 
 * @param {net.Socket} conn - The client connection
 * @param {Array<string>} params - Command parameters [command, newsgroups, date, time, GMT]
 */
function Newnews(conn, params) {
    var Log = LogCommands.extend('newnews');
    // 230: List of new articles follows
    conn.write(Response.code[230]);
    // Not fully implemented - no new articles to report
    conn.write(".\r\n");
    Log("NEWNEWS command - no new articles");
}

/**
 * Handle POST command
 * Accept an article to be posted
 * 
 * @param {net.Socket} conn - The client connection
 */
function Post(conn) {
    var Log = LogCommands.extend('post');
    // 440: Posting not allowed
    conn.write(Response.code[440]);
    Log("POST command - posting not allowed");
}

/**
 * Handle IHAVE command
 * Offer an article for transfer (server-to-server)
 * 
 * @param {net.Socket} conn - The client connection
 * @param {Array<string>} params - Command parameters [command, message-id]
 */
function Ihave(conn, params) {
    var Log = LogCommands.extend('ihave');
    // 435: Article not wanted
    conn.write(Response.code[435]);
    Log("IHAVE command - article not wanted");
}

/**
 * Handle SLAVE command (RFC 977)
 * Indicates client is a slave server
 * 
 * @param {net.Socket} conn - The client connection
 */
function Slave(conn) {
    var Log = LogCommands.extend('slave');
    // 202: Slave status noted
    conn.write(Response.code[202]);
    Log("SLAVE command acknowledged");
}

/**
 * Handle LISTGROUP command
 * List article numbers in a newsgroup
 * 
 * @param {net.Socket} conn - The client connection
 * @param {Object} sockets - Map of client connections to their selected newsgroups
 * @param {Array<string>} params - Command parameters [command, groupname, range]
 */
function Listgroup(conn, sockets, params) {
    var Log = LogCommands.extend('listgroup');
    
    var groupname = params[1] || sockets[conn.remoteAddress + ':' + conn.remotePort];
    
    if (!groupname) {
        // 412: No newsgroup selected
        conn.write(Response.code[412]);
        return;
    }
    
    groups = Driver.LoadGroups();
    
    if (groups[groupname]) {
        // Store selected group for this client
        sockets[conn.remoteAddress + ':' + conn.remotePort] = groupname;
        
        // 211: List of article numbers follows
        conn.write('211 ' + groups[groupname]['high'] + ' 1 ' + groups[groupname]['high'] + ' ' + groupname + "\r\n");
        
        // List article numbers
        for (var i = 1; i <= groups[groupname]['high']; i++) {
            conn.write(i + "\r\n");
        }
        conn.write(".\r\n");
        Log("LISTGROUP for " + groupname);
    }
    else {
        // 411: No such newsgroup
        conn.write(Response.code[411]);
        Log("LISTGROUP - group not found: " + groupname);
    }
}

/**
 * Handle HDR command (RFC 3977)
 * Retrieve specific header fields from articles
 * 
 * @param {net.Socket} conn - The client connection
 * @param {Object} sockets - Map of client connections to their selected newsgroups
 * @param {Array<string>} params - Command parameters [command, header, range]
 */
function Hdr(conn, sockets, params) {
    var Log = LogCommands.extend('hdr');
    
    if (!Settings.RFC["3977"]) {
        // Command not available in RFC 977 mode
        conn.write(Response.code[500]);
        return;
    }
    
    // Check if client has selected a newsgroup
    if (!sockets[conn.remoteAddress + ':' + conn.remotePort]) {
        conn.write(Response.code[412]);
        return;
    }
    
    // 225: Headers follow (RFC 3977)
    conn.write("225 Headers follow\r\n");
    
    // Not fully implemented - placeholder
    conn.write(".\r\n");
    Log("HDR command - not fully implemented");
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