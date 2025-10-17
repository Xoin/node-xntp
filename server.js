/**
 * NNTP Server Implementation
 * 
 * This is the main server file that handles NNTP (Network News Transfer Protocol) connections.
 * It creates a TCP server that listens for incoming client connections and processes NNTP commands.
 */

const net = require('net');
var fs = require('fs');
var Commands = require('./nntp/commands.js');
var Response = require('./nntp/response.js');
var debug = require('debug');
var LogServer = debug('server');
var LogClientData = LogServer.extend('client data');

// Load server settings from settings.json
let Settings;
if (fs.existsSync('./settings.json')) {
    Settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'))
}

// Store active client connections mapped by their remote address
var sockets = [];

// Create TCP server and configure connection handler
var server = net.createServer();
server.on('connection', handleConnection);
server.listen(Settings.serverport, Settings.serveradres);

LogFallback(`Server Created at ${Settings.serveradres}:${Settings.serverport}`);

/**
 * Handle incoming client connections
 * 
 * Sets up event handlers for data, close, and error events on the connection.
 * Sends initial NNTP greeting to client (201 - no posting allowed).
 * 
 * @param {net.Socket} conn - The client connection socket
 */
function handleConnection(conn) {
    conn.setEncoding('utf8');
    var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
    LogFallback('new client connection from ' + remoteAddress);
    
    // Send initial greeting - 201 means server ready but no posting allowed
    conn.write(Response.code[201]);
    
    // Set up event handlers
    conn.on('data', onData);
    conn.once('close', onClose);
    conn.on('error', onError);
    
    /**
     * Handle incoming data from client
     * Parses NNTP commands and dispatches to appropriate handlers
     * 
     * @param {string} d - Raw data received from client
     */
    function onData(d) {
        LogClientData(d.replace("\r\n", ""));
        
        // Parse command and arguments (space-separated)
        var temp = d.replace("\r\n", "").split(" ");

        // Validate command is recognized
        if (!Commands.ValidCommands().includes(temp[0])) {
        }
        
        // Dispatch to appropriate command handler
        switch (temp[0]) {
            case "CAPABILITIES":
                Commands.Capabilities(conn);
                break;
            case "MODE":
                Commands.Mode(conn, temp[1]);
                break;
            case "LIST":
                Commands.List(conn, sockets);
                break;
            case "GROUP":
                Commands.Group(conn, sockets, temp);
                break;
            case "DATE":
                Commands.Date(conn);
                break;
            case "OVER":
            case "XOVER":
                Commands.Xover(conn, sockets, temp);
                break;
            case "ARTICLE":
                Commands.Article(conn, sockets, temp);
                break;
            case "HEAD":
                Commands.Head(conn, sockets, temp);
                break;
            default:
                break;
        }
    }

    /**
     * Handle connection close event
     */
    function onClose() {
        LogFallback(`connection from ${remoteAddress} closed`);
    }

    /**
     * Handle connection error event
     * 
     * @param {Error} err - The error that occurred
     */
    function onError(err) {
        LogFallback(`Connection ${remoteAddress} error: ${err.message}`);
    }
}

/**
 * Log messages with fallback to console when debug module is disabled
 * 
 * @param {string} params - The message to log
 */
function LogFallback(params) {
    if (LogServer.enabled) {
        LogServer(params);
    } else {
        console.log("[s] " + params);
    }
}