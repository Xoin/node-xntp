const Core = {
    Response: require("../response"),
    Date: require("../../includes/date"),
    Routing: require("../../server/routing"),
    RFC: require("../../includes/settings").RFC
}

function Date(ConnData, params) {
    switch (Core.RFC) {
        case 977:
            break;
        case 3977:
            Date3977(ConnData, params);
            break;
        default:
            break;
    }
}

function Date3977(ConnData, params) {
    Core.Routing.Send(new Core.Routing.Package(ConnData, Core.Response.Message(111, Core.Date.Server())));
}

module.exports = {
    Date: Date
};