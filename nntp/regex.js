var Patterns = {
    "3977": {
        'HELP': {
            //HELP
            'help': /^HELP$/
        },
        'ARTICLE': {
            //ARTICLE 1234
            'article': /^(ARTICLE) ([0-9]+)$/
        },
        'MODE': {
            //MODE READER
            'modereader': /^MODE READER$/
        }
    }
}

module.exports = {
    Patterns: Patterns
};