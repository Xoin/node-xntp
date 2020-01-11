var Core = require('../includes');

var Command = {
    Article: require("./commands/ARTICLE"),
    Body: require("./commands/BODY"),
    Capabilities: require("./commands/CAPABILITIES"),
    Date: require("./commands/DATE"),
    Group: require("./commands/GROUP"),
    Hdr: require("./commands/HDR"),
    Head: require("./commands/HEAD"),
    Help: require("./commands/HELP"),
    Ihave: require("./commands/IHAVE"),
    Last: require("./commands/LAST"),
    List: require("./commands/LIST"),
    Listgroup: require("./commands/LISTGROUP"),
    Mode: require("./commands/MODE"),
    Newgroups: require("./commands/NEWGROUPS"),
    Newnews: require("./commands/NEWNEWS"),
    Next: require("./commands/NEXT"),
    Over: require("./commands/OVER"),
    Post: require("./commands/POST"),
    Quit: require("./commands/QUIT"),
    Stat: require("./commands/STAT"),
    Xover: require("./commands/XOVER")
}



function Parser(conn, sockets, inputdata) {
    var rfcpatterns = Core.Regex.Patterns[Core.RFC];
    var commandfound = false;
    Mainloop:
    for (var key in rfcpatterns) {
        if (commandfound) {
            break;
        }
        var value = rfcpatterns[key];
        console.log(key, value);
        if (Object.keys(value).length > 0) {
            console.log("objects");
            for (var key2 in value) {
                var value2 = value[key2];
                if (value2) {
                    Hub(key2, inputdata.match(value2))
                    commandfound = true;
                    break Mainloop;
                }
            }
            conn.write(Core.Response.Message(501));
        }
        else {
            Hub(key, inputdata.match(value))
        }
    }
    conn.write(Core.Response.Message(500));
}

function Hub(commandid, data) {
    switch (commandid) {
        //3977
        case "help":

            break;
        //3977
        default:
            break;
    }
}


module.exports = {
    Parser
};