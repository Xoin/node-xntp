var incl = require('../includes');

module.exports = {
    Parser
};

function Parser(conn, sockets, command) {
    var commandfound = false;
    var rfcpatterns = incl.Regex.Patterns[incl.RFC];
    var inputdata = "ARTICLE <i.am.not.there@example.com>";

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
                    console.log(inputdata.match(value2));
                    commandfound = true;
                    break Mainloop;
                }
            }
        }
        else {
            console.log(inputdata.match(value));
        }
    }
}