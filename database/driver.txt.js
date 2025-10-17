/**
 * Text File Database Driver
 * 
 * This driver implements database operations using a simple text file-based storage system.
 * Articles and headers are stored as text files in a directory structure organized by
 * server/group/article-id.
 */

var fs = require('fs');
var debug = require('debug');
var LogDriver = debug('driver');

/**
 * Convert JavaScript Date to NNTP date format
 * Format: DD MMM YYYY HH:MM:SS -0000
 * 
 * @param {Date|string} olddate - Date object or date string to convert
 * @returns {string} Formatted date string for NNTP protocol
 */
function ConvertDates(olddate) {
    var a = new Date(olddate);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${a.getDate()} ${months[a.getMonth()]} ${a.getFullYear()} ${a.getHours()}:${a.getMinutes()}:${a.getSeconds()} -0000`;
}

/**
 * Load newsgroups configuration from groups.json
 * 
 * @returns {Object} Object mapping newsgroup names to their metadata (high/low article numbers)
 */
function LoadGroups() {
    if (fs.existsSync('./groups.json')) {
        let rawdata = fs.readFileSync('./groups.json');
        return JSON.parse(rawdata);
    }
}

/**
 * Load article content from file system
 * Supports both message-id format (<id@group.server>) and numeric article id
 * 
 * @param {string} request - Article identifier (message-id or numeric id)
 * @param {string} newsgroup - Newsgroup name (format: group.server)
 * @returns {string|boolean} Article content as string, or false if not found
 */
function LoadArticle(request, newsgroup) {
    LogDriver(request + ' ' + newsgroup).extend('LoadArticle')
    
    // Parse message-id format: <123@group-name.server-name>
    const regex = /(<([0-9]+)@([a-z\-]+).([a-z\-]+)>|[0-9]+)/gm;
    let m = regex.exec(request);
    var server = m[4];
    var group = m[3];
    var id = m[2];
    
    // Handle message-id format
    if (m[2] != undefined) {
        if (fs.existsSync(`./data/${server}/${group}/${id} - ${group}.${server}.txt`)) {
            let rawdata = fs.readFileSync(`../data/${server}/${group}/${id} - ${group}.${server}.txt`);
            return String(rawdata);
        }
        else {
            return false;
        }
    }
    else {
        // Handle numeric article id format
        var server = newsgroup.split('.')[1];
        var group = newsgroup.split('.')[0];
        var id = m[1];
        if (fs.existsSync(`./data/${server}/${group}/${id} - ${group}.${server}.txt`)) {
            let rawdata = fs.readFileSync(`./data/${server}/${group}/${id} - ${group}.${server}.txt`);
            return String(rawdata);
        }
        else {
            return false;
        }
    }
}

/**
 * Load article header overview information from file system
 * Headers are stored in separate .head.txt files for quick access
 * 
 * @param {number} id - Numeric article identifier
 * @param {string} newsgroup - Newsgroup name (format: group.server)
 * @returns {string|boolean} Article header data as string, or false if not found
 */
function LoadHeader(id, newsgroup) {
    // Parse newsgroup name to extract server and group
    var server = newsgroup.split('.')[1];
    var group = newsgroup.split('.')[0];
    
    // Check if header file exists
    if (fs.existsSync(`./data/${server}/${group}/${id} - ${group}.${server}.head.txt`)) {
        let rawdata = fs.readFileSync(`./data/${server}/${group}/${id} - ${group}.${server}.head.txt`);
        return String(rawdata);
    }
    else {
        return false;
    }
}

module.exports = {
    ConvertDates,
    LoadGroups,
    LoadArticle,
    LoadHeader
};