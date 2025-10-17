# Test Data for Text Driver

This directory contains test data for the NNTP text file database driver.

## Directory Structure

```
data/
└── testserver/
    └── test-group/
        ├── 1 - test-group.testserver.txt      # Full article (headers + body)
        ├── 1 - test-group.testserver.head.txt # Overview/header data
        ├── 2 - test-group.testserver.txt
        ├── 2 - test-group.testserver.head.txt
        ├── 3 - test-group.testserver.txt
        └── 3 - test-group.testserver.head.txt
```

## File Formats

### Full Article Files (`*.txt`)

Format: Standard NNTP article format with headers, blank line separator, and body

```
Path: testserver!test-group
From: user@example.com
Newsgroups: test-group.testserver
Subject: Article Subject
Message-ID: <id@test-group.testserver>
Date: Mon, 01 Jan 2024 12:00:00 +0000
Lines: 1

Article body text goes here.
```

### Header/Overview Files (`*.head.txt`)

Format: Tab-separated values for XOVER/OVER command response

```
article_number\tsubject\tfrom\tdate\tmessage-id\treferences
```

Example:
```
1	Test Article 1	test.user@example.com	Mon, 01 Jan 2024 12:00:00 +0000	<1@test-group.testserver>	
```

## Test Newsgroup

The test data includes one newsgroup:

- **test-group.testserver**: A test newsgroup with 3 articles (article numbers 1-3)

## Testing Commands

You can test various NNTP commands with this data:

```bash
# Start the server
node server.js

# Connect with telnet or nc
nc localhost 5555

# Test commands
MODE READER
LIST
GROUP test-group.testserver
ARTICLE 1
HEAD 2
BODY 3
STAT 1
XOVER 1-3
LISTGROUP test-group.testserver
QUIT
```

## Adding More Test Data

To add more articles:

1. Create article files in the appropriate directory:
   - `data/{server}/{group}/{id} - {group}.{server}.txt` (full article)
   - `data/{server}/{group}/{id} - {group}.{server}.head.txt` (overview data)

2. Update `groups.json` to reflect the new article count:
   ```json
   {
     "group-name.server": {
       "low": 1,
       "high": 10  // Update this number
     }
   }
   ```

3. Restart the server to pick up the changes
