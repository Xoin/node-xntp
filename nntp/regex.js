'use strict';

var Patterns = {
    "3977": {
        'HELP': {
            //ARTICLE <i.am.not.there@example.com>
            'test': /^HELP$/
        },
        'ARTICLE': {
            //ARTICLE <i.am.not.there@example.com>
            'test': /^(ARTICLE) ([0-9]+)$/
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