function Capabilities(conn) {
    var Log = LogCommands.extend('capabilities');
    Log(`${Response.code[3977][101]} ${ValidCommands().join("\r\n")} \r\n.\r\n`);
    conn.write(`${Response.code[3977][101]} ${ValidCommands().join("\r\n")} \r\n.\r\n`);

}