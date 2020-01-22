const Article = require("./commands/ARTICLE");
const Body = require("./commands/BODY");
const Capabilities = require("./commands/CAPABILITIES");
const Date = require("./commands/DATE");
const Group = require("./commands/GROUP");
const Hdr = require("./commands/HDR");
const Head = require("./commands/HEAD");
const Help = require("./commands/HELP");
const Ihave = require("./commands/IHAVE");
const Last = require("./commands/LAST");
const List = require("./commands/LIST");
const Listgroup = require("./commands/LISTGROUP");
const Mode = require("./commands/MODE");
const Newgroups = require("./commands/NEWGROUPS");
const Newnews = require("./commands/NEWNEWS");
const Next = require("./commands/NEXT");
const Over = require("./commands/OVER");
const Post = require("./commands/POST");
const Quit = require("./commands/QUIT");
const Stat = require("./commands/STAT");
const Xover = require("./commands/XOVER");
const Core = {
    Regex: require("./regex"),
    Response: require("./response"),
    Routing: require("../server/routing"),
    RFC: require("../includes/settings").RFC
}

function Parser(ConnData, inputdata) {
    let rfcpatterns = Core.Regex.Patterns[Core.RFC];
    let commandtypes = rfcpatterns[inputdata.split(' ')[0]];
    if (commandtypes) {
        for (let key in commandtypes) {
            let value = commandtypes[key];
            if (inputdata.match(value)) {
                Hub(key, inputdata.match(value));
                return true;
            }
        }
        Core.Routing.Send(ConnData, Core.Response.Message(501));
        return false;
    }
    else {
        Core.Routing.Send(ConnData, Core.Response.Message(500));
        return false;
    }
}

function Hub(commandid, data) {
    switch (commandid) {
        //3977
        case "modereader":
            Mode.Mode(commandid, data)
            break;
        //3977
        default:
            break;
    }
}

module.exports = {
    Parser: Parser,
    Hub: Hub
};