function List(conn, params) {
    var Log = LogCommands.extend('list');
    Log("%o", Response.code[3977][215])
    conn.write(Response.code[3977][215]);
    groups = Driver.LoadGroups();
    Object.getOwnPropertyNames(groups).forEach(element => {
        conn.write(`${element} ${groups[element]['high']} ${groups[element]['low']} ${groups[element]['high']}\r\n`);
    });
    Log("%O", JSON.stringify(groups))
    conn.write(".\r\n");
}