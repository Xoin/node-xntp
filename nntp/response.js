var incl = require('../includes');
var code = {
    /*
    The first digit of the response broadly indicates the success, failure, or progress of the previous command.
        1xx - Informative message
        2xx - Command ok
        3xx - Command ok so far, send the rest of it.
        4xx - Command was correct, but couldn’t be performed for
        some reason.
        5xx - Command unimplemented, or incorrect, or a serious
        program error occurred.

    The next digit in the code indicates the function response category.
        x0x - Connection, setup, and miscellaneous messages
        x1x - Newsgroup selection
        x2x - Article selection
        x3x - Distribution functions
        x4x - Posting
        x8x - Nonstandard (private implementation) extensions
        x9x - Debugging output
    */
    3977: {
        100: "help text follows",
        101: "Capability list:",
        199: "debug output",

        200: "server ready - posting allowed",
        201: "server ready - no posting allowed",
        202: "slave status noted",
        205: "closing connection - goodbye!",
        211: "n f l s group selected",
        215: "list of newsgroups follows",
        220: "n <a> article retrieved - head and body follow",
        221: "n <a> article retrieved - head follows",
        222: "n <a> article retrieved - body follows",
        223: "n <a> article retrieved - request text separately",
        224: "Overview information follows",
        230: "list of new articles by message-id follows",
        231: "list of new newsgroups follows",
        235: "article transferred ok",
        240: "article posted ok",

        335: "send article to be transferred. End with <CR-LF>.<CR-LF>",
        340: "send article to be posted. End with <CR-LF>.<CR-LF>",

        400: "service discontinued",
        411: "no such news group",
        412: "no newsgroup has been selected",
        420: "no current article has been selected",
        421: "no next article in this group",
        422: "no previous article in this group",
        423: "no such article number in this group",
        430: "no such article found",
        435: "article not wanted - do not send it",
        436: "transfer failed - try again later",
        437: "article rejected - do not try again.",
        440: "posting not allowed",

        500: "command not recognized",
        501: "command syntax error",
        502: "access restriction or permission denied",
        503: "program fault - command not performed"
    }
}

function Message(number) {
    if (code[incl.RFC][number]) {
        return number + " " + code[incl.RFC][number] + "\r\n";
    }
    else {
        return false;
    }

}

module.exports = {
    Message
};
