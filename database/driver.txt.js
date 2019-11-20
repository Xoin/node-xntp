var fs = require('fs');
function ConverDates(olddate) {
    var a = new Date(olddate);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var offset = '-0000';
    return `${date} ${month} ${year} ${hour}:${min}:${sec} ${offset}`;
}

function LoadGroups() {
    if (fs.existsSync('./groups.json')) {
        let rawdata = fs.readFileSync('./groups.json');
        return JSON.parse(rawdata);
    }
}

function LoadArticle(request, newsgroup) {
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
        console.log(`./data/${server}/${group}/${id} - ${group}.${server}.txt`)
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
    ConverDates,
    LoadGroups,
    LoadArticle,
    LoadHeader
};