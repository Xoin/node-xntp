var includes = require('./includes');
console.log(includes.RFC);
var testcommand = "ARTICLE <i.am.not.there@example.com>";
var splitcommand = testcommand.substring(0, testcommand.indexOf(" "))

var test = includes.Regex.Patterns[includes.RFC];

console.log(includes.Response.code[includes.RFC][500])
console.log(includes.Response.code[includes.RFC][501])

var found = false;
Loop1:
for (var key in test) {
    if (found) {
        break;
    }
    var value = test[key];
    console.log(key, value);
    if (Object.keys(value).length > 0) {
        console.log("objects");
        for (var key2 in value) {
            var value2 = value[key2];
            if (value2) {
                console.log(testcommand.match(value2));
                found = true;
                break Loop1;
            }
        }
    }
    else {
        console.log(testcommand.match(value));
    }
}