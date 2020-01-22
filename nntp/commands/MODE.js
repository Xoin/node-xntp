function Mode(ConnData, params) {
    let Core = require('../../includes');
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
    let Core = require('../../includes');
    if (Core.Settings.posting) {
        Core.Routing.Send(ConnData, Core.Response.Message(200));
    }
    else {
        Core.Routing.Send(ConnData, Core.Response.Message(201));
    }

}

module.exports = {
    Mode: Mode
};