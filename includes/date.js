function New(newdate) {
    return Date(newdate);
}

function Old(olddate) {
    const date = new Date(olddate);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    // That offset will give bugs I bet...
    const offset = date.toString().match(/((\+|-)[0-9]+)/)[0];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${offset}`;
}

function Server() {
    const date = new Date();
    return `${date.getFullYear()}${AddZero(date.getMonth() + 1)}${AddZero(date.getDate())}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
}

function AddZero(number) {
    if (number < 10) {
        return "0" + number;
    }
    else {
        return number;
    }
}

module.exports = {
    New: New,
    Old: Old,
    Server: Server
}