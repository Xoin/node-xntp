'use strict';
var Core = require('../includes.js');

var Patterns = {
    "3977": {
        'HELP': {
            //ARTICLE <i.am.not.there@example.com>
            'test': /^HELP$/
        },
        'ARTICLE': {
            //ARTICLE <i.am.not.there@example.com>
            'test': /^(ARTICLE) ([0-9]+)$/
        }
    }
}

module.exports = {
    Patterns: Patterns
};