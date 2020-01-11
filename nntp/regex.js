var Patterns = {
    3977: {
        'article': {
            //ARTICLE <i.am.not.there@example.com>
            'test': /^(ARTICLE) (<[a-z\.@]+>)$/,
            'test2': /^(ARTICLE) ([0-9]+)$/g
        },
        'post': /^(ARTICLE) ([0-9]+)$/g,
        'help': /^HELP$/g
    }
}

module.exports = {
    Patterns: Patterns
};