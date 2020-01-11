var Core = require('../includes');

class Sockets {
    constructor() {
        this.sockets = [];
    }
    List() {
        return this.sockets;
    }
    Add(ip, port) {
        var sessions = 0;
        var canconnect = true;
        if (!this.sockets.includes(`${ip}:${port}`)) {
            if (this.sockets.length > 0) {
                this.sockets.forEach(element => {
                    if (element.startsWith(`${ip}`)) {
                        sessions++;
                        if (sessions < Core.Settings.connectionlimit) {
                            console.log(sessions, `${ip}:${port}`, Core.Settings.connectionlimit);
                        }
                        else {
                            canconnect = false;
                        }
                    }
                });
            }
            if (canconnect) {
                this.sockets.push(`${ip}:${port}`);
            }
        }
    }
    Remove(ip, port) {
        for (var i = 0; i < this.sockets.length; i++) {
            if (this.sockets[i] === `${ip}:${port}`) {
                this.sockets.splice(i, 1);
            }
        }
    }
}

function Input(params) {
    Core.Commands.Parser(conn, sockets, d.replace("\r\n", ""))
}

function Output(params) {

}

module.exports = {
    Sockets: Sockets,
    Input: Input,
    Output: Output
};