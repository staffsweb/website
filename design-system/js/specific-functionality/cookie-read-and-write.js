function readCookie(name) {
    var regex = new RegExp("[; ]" + name + "=([^\\s;]*)");
    var match = (" " + document.cookie).match(regex);
    if (name && match) {
        return unescape(match[1]);
    } else {
        return "";
    }
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}