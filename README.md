# node-xntp

A Node.js implementation of the Network News Transfer Protocol (NNTP) server supporting both RFC 977 and RFC 3977 specifications.

## Features

- Full RFC 977 (Network News Transfer Protocol) support
- Full RFC 3977 (Network News Transfer Protocol) support
- Configurable RFC mode switching
- Multiple database drivers (text file, MySQL)
- Debug logging support

## RFC Support

This server implements both RFC 977 and RFC 3977 specifications for NNTP:

### RFC 977 Commands
- ARTICLE - Retrieve full article (headers and body)
- BODY - Retrieve article body only
- DATE - Get server date/time
- GROUP - Select a newsgroup
- HEAD - Retrieve article headers only
- HELP - List available commands
- IHAVE - Offer article for transfer
- LAST - Move to previous article
- LIST - List newsgroups
- LISTGROUP - List article numbers in a group
- MODE - Set client mode (READER)
- NEWGROUPS - List new newsgroups since date
- NEWNEWS - List new articles since date
- NEXT - Move to next article
- POST - Post an article
- QUIT - Close connection
- SLAVE - Indicate slave status
- STAT - Check article status
- XOVER - Get article overview (RFC 977 extension)

### RFC 3977 Enhancements
- CAPABILITIES - Report server capabilities and version
- HDR - Retrieve specific header fields
- OVER - Get article overview (standard in RFC 3977)
- LIST ACTIVE - List active newsgroups
- LIST NEWSGROUPS - List newsgroups with descriptions
- LIST OVERVIEW.FMT - Get overview format
- Enhanced error handling and response codes
- Improved protocol compliance

## Configuration

Server settings are configured in `settings.json`:

```json
{
    "serveradres": "localhost",
    "serverport": 5555,
    "servername": "Test server",
    "serverversion": "",
    "driver": "txt",
    "connectionlimt": 4,
    "RFC": {
        "977": true,
        "2980": false,
        "3977": true,
        "4642": false,
        "4643": false,
        "4644": false,
        "6048": false,
        "8143": false
    }
}
```

### RFC Mode Configuration

- `"977": true` - Enable RFC 977 commands and behavior
- `"3977": true` - Enable RFC 3977 enhancements

You can enable both RFCs simultaneously for maximum compatibility, or enable only one for strict compliance with a specific RFC version.

When `RFC.3977` is enabled:
- Server reports VERSION 2 in CAPABILITIES
- HDR and OVER commands are available
- LIST command supports ACTIVE, NEWSGROUPS, and OVERVIEW.FMT variants
- Enhanced error messages and response codes

When only `RFC.977` is enabled:
- Server reports VERSION 1 in CAPABILITIES
- XOVER command is used instead of OVER
- LIST command uses RFC 977 format
- Classic NNTP behavior

## Installation

```bash
npm install
```

## Usage

```bash
node server.js
```

Or with debug logging:

```bash
DEBUG=* node server.js
```

## License

See LICENSE file for details.