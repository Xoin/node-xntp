var Core = require('../includes');

// Short term storage
class Meta {
    constructor(ip, port) {
        this.ip = ip
        this.port = port
    }
}

// Long term storage
var Sessions = {};

function ConnectionAdd(meta, conn) {
    if (Sessions[meta.ip]) {
        if (Object.keys(Sessions[meta.ip]).length < Core.Settings.connectionlimit) {
            Sessions[meta.ip][meta.port] = {};
            Sessions[meta.ip][meta.port]["conn"] = conn;
            Sessions[meta.ip][meta.port]["date"] = new Date();
            Sessions[meta.ip][meta.port]["state"] = null;
            Sessions[meta.ip][meta.port]["auth"] = null;
        }
    }
    else {
        Sessions[meta.ip] = {};
        Sessions[meta.ip][meta.port] = {};
        Sessions[meta.ip][meta.port]["conn"] = conn;
        Sessions[meta.ip][meta.port]["date"] = new Date();
        Sessions[meta.ip][meta.port]["state"] = null;
        Sessions[meta.ip][meta.port]["auth"] = null;
    }
}

function ConnectionRemove(meta) {
    if (Sessions[meta.ip] && Sessions[meta.ip][meta.port]) {
        delete Sessions[meta.ip][meta.port];
        return true;
    }
    else {
        return false;
    }
}

function ConnectionGet(meta) {
    if (Sessions[meta.ip] && Sessions[meta.ip][meta.port]) {
        return Sessions[meta.ip][meta.port];
    }
    else {
        return false;
    }
}

function ConnectionDateSet(meta) {
    Sessions[meta.ip][meta.port]["date"] = new Date();
}

function ConnectionDateGet(meta) {
    return Sessions[meta.ip][meta.port]["date"];
}

function StateSet(meta, state) {
    Sessions[meta.ip][meta.port]["state"] = state;
}

function StateGet(meta) {
    return Sessions[meta.ip][meta.port]["state"];
}

function AuthSet(meta, auth) {
    Sessions[meta.ip][meta.port]["auth"] = auth;
}

function AuthGet(meta) {
    return Sessions[meta.ip][meta.port]["auth"];
}

function Send(meta, data) {
    ConnectionGet(meta).write(data);
}

module.exports = {
    Meta: Meta,
    ConnectionAdd: ConnectionAdd,
    ConnectionRemove: ConnectionRemove,
    ConnectionGet: ConnectionGet,
    ConnectionDateSet: ConnectionDateSet,
    ConnectionDateGet: ConnectionDateGet,
    StateSet: StateSet,
    StateGet: StateGet,
    AuthSet: AuthSet,
    AuthGet: AuthGet,
    Send: Send
};