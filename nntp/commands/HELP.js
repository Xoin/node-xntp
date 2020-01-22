const Core = {
    Regex: require("../regex"),
    Response: require("../response"),
    Routing: require("../../server/routing"),
    RFC: require("../../includes/settings").RFC
}

function Help(ConnData, params) {
    switch (Core.RFC) {
        case 977:
            break;
        case 3977:
            Help3977(ConnData, params);
            break;
        default:
            break;
    }
}

function Help3977(ConnData, params) {
    Core.Routing.Send(new Core.Routing.Package(ConnData, Core.Response.Message(100)));
}

module.exports = {
    Help: Help
};