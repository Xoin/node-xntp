
// var Command = {
//     Article: require("./commands/ARTICLE"),
//     Body: require("./commands/BODY"),
//     Capabilities: require("./commands/CAPABILITIES"),
//     Date: require("./commands/DATE"),
//     Group: require("./commands/GROUP"),
//     Hdr: require("./commands/HDR"),
//     Head: require("./commands/HEAD"),
//     Help: require("./commands/HELP"),
//     Ihave: require("./commands/IHAVE"),
//     Last: require("./commands/LAST"),
//     List: require("./commands/LIST"),
//     Listgroup: require("./commands/LISTGROUP"),
//     Mode: require("./commands/MODE"),
//     Newgroups: require("./commands/NEWGROUPS"),
//     Newnews: require("./commands/NEWNEWS"),
//     Next: require("./commands/NEXT"),
//     Over: require("./commands/OVER"),
//     Post: require("./commands/POST"),
//     Quit: require("./commands/QUIT"),
//     Stat: require("./commands/STAT"),
//     Xover: require("./commands/XOVER")
// }
let Core = require('./../includes');

function Parser(ConnData, inputdata) {
    Core = require('./../includes');
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
        case "help":
            console.log(data);
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