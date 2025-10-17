# node-xntp

A modular, highly compatible Node.js implementation of the Network News Transfer Protocol (NNTP) server, designed to work as a relay or independent server for both modern and retro systems.

**This project was developed with GitHub Copilot**, showcasing AI-assisted development for implementing complex protocols.

## Project Goals

node-xntp aims to create a flexible NNTP server that:
- **Supports multiple RFC standards** for maximum compatibility across different client implementations
- **Works with retro systems** including classic USENET clients from the 1980s-1990s
- **Functions as a relay or standalone server** for both modern and legacy newsgroup systems
- **Provides modular architecture** with pluggable database drivers and configurable protocol versions

## Features

- Full RFC 977 (Network News Transfer Protocol) support
- Full RFC 3977 (Network News Transfer Protocol) support
- RFC 850 (Standard for Interchange of USENET Messages) posting support
- RFC 2980 (Common NNTP Extensions) support
- Configurable RFC mode switching
- Multiple database drivers (text file, MySQL)
- Debug logging support

## RFC Support

This server implements multiple RFC specifications for maximum compatibility:

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

### RFC 850 - Standard for Interchange of USENET Messages
- POST command with RFC 850 message format support
- Required headers: From, Date, Newsgroups, Subject, Message-ID
- Optional headers: Path, Reply-To, References, Organization
- Automatic header generation for missing fields
- Article validation and storage

### RFC 2980 - Common NNTP Extensions
- XGTITLE - Retrieve newsgroup descriptions/titles
- XHDR - Retrieve specific header field from articles
- XPAT - Search article headers matching patterns
- LIST ACTIVE.TIMES - Newsgroup creation times
- Enhanced wildmat pattern matching

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
    "posting": false,
    "RFC": {
        "977": true,
        "2980": true,
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
- `"2980": true` - Enable RFC 2980 extensions (XGTITLE, XHDR, XPAT)
- `"3977": true` - Enable RFC 3977 enhancements
- `"posting": true` - Enable article posting with RFC 850 format validation

You can enable multiple RFCs simultaneously for maximum compatibility, or enable only specific ones for strict compliance with particular RFC versions.

**RFC Mode Behaviors:**

When `RFC.977` is enabled:
- Server reports VERSION 1 in CAPABILITIES
- XOVER command is used instead of OVER
- LIST command uses RFC 977 format
- Classic NNTP behavior for retro compatibility

When `RFC.2980` is enabled:
- XGTITLE, XHDR, XPAT commands become available
- LIST ACTIVE.TIMES supported
- Wildmat pattern matching for newsgroup queries

When `RFC.3977` is enabled:
- Server reports VERSION 2 in CAPABILITIES
- HDR and OVER commands are available
- LIST command supports ACTIVE, NEWSGROUPS, and OVERVIEW.FMT variants
- Enhanced error messages and response codes

When `posting` is enabled:
- POST command accepts articles with RFC 850 message format
- Automatic validation of required headers
- Generates Message-ID, Path, and Date if missing

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

## Testing

Test data is included in the `data/` directory with a sample newsgroup `test-group.testserver` containing 3 articles.

### Run the test suite:

```bash
node test-commands.js
```

### Manual testing with netcat or telnet:

```bash
nc localhost 5555

# Then enter commands:
CAPABILITIES
MODE READER
LIST
GROUP test-group.testserver
LISTGROUP test-group.testserver
ARTICLE 1
HEAD 2
BODY 3
STAT 1
XOVER 1-3
DATE
HELP
QUIT
```

See `data/README.md` for information about the test data structure and how to add more test articles.

## Development

This project was developed using GitHub Copilot, demonstrating how AI pair programming can assist in implementing complex network protocols. The development process showcased:

- **Protocol Implementation**: AI assistance in understanding and implementing multiple RFC specifications
- **Code Quality**: Consistent code style and comprehensive documentation
- **Bug Fixing**: Iterative problem-solving and debugging with AI suggestions
- **Testing**: Creation of test data and validation scripts

### Contributing

When contributing to this project, please:
- Follow the existing code style and documentation patterns
- Add tests for new features
- Update documentation for any protocol changes
- Test with both modern and retro NNTP clients when possible

## Compatibility

node-xntp has been designed to work with:
- **Modern newsreaders**: Mozilla Thunderbird, Newsbin, SABnzbd
- **Classic newsreaders**: tin, trn, nn, slrn (1980s-1990s era)
- **Web-based clients**: Any NNTP-compatible web interface
- **Server-to-server**: Can act as a relay for other NNTP servers

## License

See LICENSE file for details.