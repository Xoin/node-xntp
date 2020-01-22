'use strict';

var Patterns = {
    "3977": {
        'HELP': {
            //HELP
            'help': /^HELP$/
        },
        'ARTICLE': {
            //ARTICLE <i.am.not.there@example.com>
            'article': /^(ARTICLE) ([0-9]+)$/
        },
        'MODE': {
            //ARTICLE <i.am.not.there@example.com>
            'modereader': /^MODE READER$/
        }
    }
}

module.exports = {
    Patterns: Patterns
};