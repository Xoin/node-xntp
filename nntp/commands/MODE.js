function Mode(conn, params) {
    var Log = LogCommands.extend('reader');
    Log("%o", params)
    if (params == "READER") {
        conn.write(Response.code[3977][200]);
        Log("%o", Response.code[3977][200])
    }
    else {
        conn.write(Response.code[3977][201]);
        Log("%o", Response.code[3977][201])
    }
}