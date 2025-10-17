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

// Store active client connections and their session data
var activeSockets = {};
var connectionCount = 0;

// Create TCP server and configure connection handler
var server = net.createServer();
server.on('connection', handleConnection);
server.listen(Settings.serverport, Settings.serveradres);

LogFallback(`Server Created at ${Settings.serveradres}:${Settings.serverport}`);

/**
 * Handle incoming client connections
 * 
 * Sets up event handlers for data, close, and error events on the connection.
 * Sends initial NNTP greeting to client.
 * Enforces connection limits and implements timeout handling.
 * 
 * @param {net.Socket} conn - The client connection socket
 */
function handleConnection(conn) {
    var remoteAddress = conn.remoteAddress + ':' + conn.remotePort;
    
    // Enforce connection limit
    if (Settings.connectionlimt && connectionCount >= Settings.connectionlimt) {
        LogFallback(`Connection limit reached, rejecting connection from ${remoteAddress}`);
        conn.write(Response.code[400]); // Service discontinued
        conn.end();
        return;
    }
    
    connectionCount++;
    conn.setEncoding('utf8');
    LogFallback(`new client connection from ${remoteAddress} (${connectionCount}/${Settings.connectionlimt || 'unlimited'})`);
    
    // Initialize session data for this connection
    activeSockets[remoteAddress] = {
        socket: conn,
        selectedGroup: null,
        currentArticle: null,
        connectedAt: Date.now(),
        lastActivity: Date.now()
    };
    
    // Send initial greeting based on posting capability
    // 200 if posting allowed, 201 if not
    if (Settings.posting) {
        conn.write(Response.code[200]);
    } else {
        conn.write(Response.code[201]);
    }
    
    // Set idle timeout (10 minutes default)
    const IDLE_TIMEOUT = 10 * 60 * 1000;
    var idleTimer = setTimeout(() => {
        LogFallback(`Connection ${remoteAddress} idle timeout`);
        conn.write("400 Idle timeout, closing connection\r\n");
        conn.end();
    }, IDLE_TIMEOUT);
    
    /**
     * Reset idle timer on activity
     */
    function resetIdleTimer() {
        if (activeSockets[remoteAddress]) {
            activeSockets[remoteAddress].lastActivity = Date.now();
        }
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            LogFallback(`Connection ${remoteAddress} idle timeout`);
            conn.write("400 Idle timeout, closing connection\r\n");
            conn.end();
        }, IDLE_TIMEOUT);
    }
    
    /**
     * Handle incoming data from client
     * Parses NNTP commands and dispatches to appropriate handlers
     * 
     * @param {string} d - Raw data received from client
     */
    function onData(d) {
        resetIdleTimer();
        LogClientData(d.replace("\r\n", ""));
        
        // Parse command and arguments (space-separated)
        var temp = d.replace("\r\n", "").split(" ");
        var command = temp[0].toUpperCase();

        // Validate command is recognized
        if (!Commands.ValidCommands().includes(command)) {
            conn.write(Response.code[500]); // Command not recognized
            LogFallback(`Unknown command from ${remoteAddress}: ${command}`);
            return;
        }
        
        // Dispatch to appropriate command handler
        switch (command) {
            case "CAPABILITIES":
                Commands.Capabilities(conn);
                break;
            case "MODE":
                Commands.Mode(conn, temp[1]);
                break;
            case "LIST":
                Commands.List(conn, activeSockets, temp);
                break;
            case "LISTGROUP":
                Commands.Listgroup(conn, activeSockets, temp);
                break;
            case "GROUP":
                Commands.Group(conn, activeSockets, temp);
                break;
            case "DATE":
                Commands.DateCommand(conn);
                break;
            case "OVER":
            case "XOVER":
                Commands.Xover(conn, activeSockets, temp);
                break;
            case "ARTICLE":
                Commands.Article(conn, activeSockets, temp);
                break;
            case "HEAD":
                Commands.Head(conn, activeSockets, temp);
                break;
            case "BODY":
                Commands.Body(conn, activeSockets, temp);
                break;
            case "STAT":
                Commands.Stat(conn, activeSockets, temp);
                break;
            case "HELP":
                Commands.Help(conn);
                break;
            case "QUIT":
                Commands.Quit(conn);
                // QUIT command will close the connection
                break;
            case "NEXT":
                Commands.Next(conn, activeSockets);
                break;
            case "LAST":
                Commands.Last(conn, activeSockets);
                break;
            case "NEWGROUPS":
                Commands.Newgroups(conn, temp);
                break;
            case "NEWNEWS":
                Commands.Newnews(conn, temp);
                break;
            case "POST":
                Commands.Post(conn, activeSockets);
                break;
            case "IHAVE":
                Commands.Ihave(conn, temp);
                break;
            case "SLAVE":
                Commands.Slave(conn);
                break;
            case "HDR":
                Commands.Hdr(conn, activeSockets, temp);
                break;
            case "XGTITLE":
                Commands.Xgtitle(conn, temp);
                break;
            case "XPAT":
                Commands.Xpat(conn, activeSockets, temp);
                break;
            case "XHDR":
                Commands.Xhdr(conn, activeSockets, temp);
                break;
            default:
                // Should not reach here due to validation above
                conn.write(Response.code[500]);
                break;
        }
    }

    /**
     * Handle connection close event
     * Clean up session data and update connection count
     */
    function onClose() {
        clearTimeout(idleTimer);
        
        // Clean up session data
        if (activeSockets[remoteAddress]) {
            delete activeSockets[remoteAddress];
        }
        
        connectionCount--;
        LogFallback(`connection from ${remoteAddress} closed (${connectionCount}/${Settings.connectionlimt || 'unlimited'} active)`);
    }

    /**
     * Handle connection error event
     * 
     * @param {Error} err - The error that occurred
     */
    function onError(err) {
        LogFallback(`Connection ${remoteAddress} error: ${err.message}`);
        
        // Clean up on error
        clearTimeout(idleTimer);
        if (activeSockets[remoteAddress]) {
            delete activeSockets[remoteAddress];
        }
    }
    
    // Set up event handlers
    conn.on('data', onData);
    conn.once('close', onClose);
    conn.on('error', onError);
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

/**
 * Graceful shutdown handler
 */
process.on('SIGINT', () => {
    LogFallback('Received SIGINT, shutting down gracefully...');
    
    // Close all active connections
    Object.keys(activeSockets).forEach(addr => {
        const session = activeSockets[addr];
        if (session && session.socket) {
            session.socket.write(Response.code[400]); // Service discontinued
            session.socket.end();
        }
    });
    
    // Close the server
    server.close(() => {
        LogFallback('Server shut down');
        process.exit(0);
    });
    
    // Force exit after 5 seconds if graceful shutdown fails
    setTimeout(() => {
        LogFallback('Forcing shutdown...');
        process.exit(1);
    }, 5000);
});