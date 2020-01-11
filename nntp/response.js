var  code = {
    /*
    The first digit of the response broadly indicates the success, failure, or progress of the previous command.
        1xx - Informative message
        2xx - Command ok
        3xx - Command ok so far, send the rest of it.
        4xx - Command was correct, but couldn’t be performed for
        some reason.
        5xx - Command unimplemented, or incorrect, or a serious
        program error occurred.

    The next digit in the code indicates the function response category.
        x0x - Connection, setup, and miscellaneous messages
        x1x - Newsgroup selection
        x2x - Article selection
        x3x - Distribution functions
        x4x - Posting
        x8x - Nonstandard (private implementation) extensions
        x9x - Debugging output
    */
    3977: {
        100:"100 help text follows\r\n",
        101:"101 Capability list:\r\n",
        199:"199 debug output\r\n",
    
        200:"200 server ready - posting allowed\r\n",
        201:"201 server ready - no posting allowed\r\n",
        202:"202 slave status noted\r\n",
        205:"205 closing connection - goodbye!\r\n",
        211:"211 n f l s group selected\r\n",
        215:"215 list of newsgroups follows\r\n",
        220:"220 n <a> article retrieved - head and body follow\r\n",
        221:"221 n <a> article retrieved - head follows\r\n",
        222:"222 n <a> article retrieved - body follows\r\n",
        223:"223 n <a> article retrieved - request text separately\r\n",
        224:"224 Overview information follows",
        230:"230 list of new articles by message-id follows\r\n",
        231:"231 list of new newsgroups follows\r\n",
        235:"235 article transferred ok\r\n",
        240:"240 article posted ok\r\n",
    
        335:"335 send article to be transferred. End with <CR-LF>.<CR-LF>\r\n",
        340:"340 send article to be posted. End with <CR-LF>.<CR-LF>\r\n",
        
        400:"400 service discontinued\r\n",
        411:"411 no such news group\r\n",
        412:"412 no newsgroup has been selected\r\n",
        420:"420 no current article has been selected\r\n",
        421:"421 no next article in this group\r\n",
        422:"422 no previous article in this group\r\n",
        423:"423 no such article number in this group\r\n",
        430:"430 no such article found\r\n",
        435:"435 article not wanted - do not send it\r\n",
        436:"436 transfer failed - try again later\r\n",
        437:"437 article rejected - do not try again.\r\n",
        440:"440 posting not allowed\r\n",
    
        500:"500 command not recognized\r\n",
        501:"501 command syntax error\r\n",
        502:"502 access restriction or permission denied\r\n",
        503:"503 program fault - command not performed\r\n"
    }
}

module.exports = {
    code
};
