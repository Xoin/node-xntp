function ConvertDates(olddate) {
    var a = new Date(olddate);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${a.getDate()} ${months[a.getMonth()]} ${a.getFullYear()} ${a.getHours()}:${a.getMinutes()}:${a.getSeconds()} -0000`;
}

function LoadGroups() {
    if (fs.existsSync('./groups.json')) {
        let rawdata = fs.readFileSync('./groups.json');
        return JSON.parse(rawdata);
    }
}
var incl = require('../includes');

function LoadArticle(request, newsgroup) {
    LogDriver(request + ' ' + newsgroup).extend('LoadArticle')
    const regex = /(<([0-9]+)@([a-z\-]+).([a-z\-]+)>|[0-9]+)/gm;
    let m = regex.exec(request);
    var server = m[4];
    var group = m[3];
    var id = m[2];
    if (m[2] != undefined) {
        if (fs.existsSync(`./data/${server}/${group}/${id} - ${group}.${server}.txt`)) {
            let rawdata = fs.readFileSync(`../data/${server}/${group}/${id} - ${group}.${server}.txt`);
            return String(rawdata);
        }
        else {
            return false;
        }
    }
    else {
        var server = newsgroup.split('.')[1];
        var group = newsgroup.split('.')[0];
        var id = m[1];
        if (fs.existsSync(`./data/${server}/${group}/${id} - ${group}.${server}.txt`)) {
            let rawdata = fs.readFileSync(`./data/${server}/${group}/${id} - ${group}.${server}.txt`);
            return String(rawdata);
        }
        else {
            return false;
        }
    }
}

function LoadHeader(id, newsgroup) {
    var server = newsgroup.split('.')[1];
    var group = newsgroup.split('.')[0];
    if (fs.existsSync(`./data/${server}/${group}/${id} - ${group}.${server}.head.txt`)) {
        let rawdata = fs.readFileSync(`./data/${server}/${group}/${id} - ${group}.${server}.head.txt`);
        return String(rawdata);
    }
    else {
        return false;
    }
}

module.exports = {
    ConvertDates,
    LoadGroups,
    LoadArticle,
    LoadHeader
};