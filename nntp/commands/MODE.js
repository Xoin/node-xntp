const Core = {
    Settings: require("../../includes/settings").Settings,
    Response: require("../response"),
    Routing: require("../../server/routing"),
    RFC: require("../../includes/settings").RFC
}

function Mode(ConnData, params) {
    switch (Core.RFC) {
        case 977:
            break;
        case 3977:
            Mode3977(ConnData, params);
            break;
        default:
            break;
    }
}

function Mode3977(ConnData, params) {
    let response = new Core.Routing.Package(ConnData);
    if (Core.Settings.posting) {
        response.Add(Core.Response.Message(200));
    }
    else {
        response.Add(Core.Response.Message(201));
    }
    Core.Routing.Send(response);
}

module.exports = {
    Mode: Mode
};