const Core = {
    Regex: require("./regex"),
    Response: require("./response"),
    Routing: require("../server/routing"),
    RFC: require("../includes/settings").RFC
}

const Commands = {
    Article: require("./commands/ARTICLE"),
    Body: require("./commands/BODY"),
    Capabilities: require("./commands/CAPABILITIES"),
    Date: require("./commands/DATE").Date,
    Group: require("./commands/GROUP"),
    Hdr: require("./commands/HDR"),
    Head: require("./commands/HEAD"),
    Help: require("./commands/HELP").Help,
    Ihave: require("./commands/IHAVE"),
    Last: require("./commands/LAST"),
    List: require("./commands/LIST"),
    Listgroup: require("./commands/LISTGROUP"),
    Mode: require("./commands/MODE").Mode,
    Newgroups: require("./commands/NEWGROUPS"),
    Newnews: require("./commands/NEWNEWS"),
    Next: require("./commands/NEXT"),
    Over: require("./commands/OVER"),
    Post: require("./commands/POST"),
    Quit: require("./commands/QUIT"),
    Stat: require("./commands/STAT"),
    Xover: require("./commands/XOVER")
}

function Parser(ConnData, inputdata) {
    let rfcpatterns = Core.Regex.Patterns[Core.RFC];
    let commandtypes = rfcpatterns[inputdata.split(' ')[0]];
    if (commandtypes) {
        for (let key in commandtypes) {
            let value = commandtypes[key];
            if (inputdata.match(value)) {
                Hub(key, ConnData, inputdata.match(value));
                return true;
            }
        }
        Core.Routing.Send(new Core.Routing.Package(ConnData, Core.Response.Message(501)));
        return false;
    }
    else {
        Core.Routing.Send(new Core.Routing.Package(ConnData, Core.Response.Message(500)));
        return false;
    }
}

function Hub(commandid, ConnData, data) {
    switch (commandid) {
        //MODE READER 3977
        case "modereader":
            Commands.Mode(ConnData, data)
            break;
        //HELP 3977
        case "help":
            Commands.Help(ConnData, data)
            break;
        case "date":
            Commands.Date(ConnData, data)
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