// CG: Functionality for use with the cookie banner, March 2021 onwards
function getOptanonCategoryFromClass(string) {
    var re = /optanon-category-([cC]\d{4})/gm;
    var matches = re.exec(string);

    if (!matches) {
        return false;
    } else {
        return matches[1];
    }
} 

function relevantCookiesAccepted(category) {
    // CG: Checks if the specific category (such as "C0002") is present in the Optanon "accepted" categories in the cookie
    var optanonCookieString = readCookie('OptanonConsent');
    
    if(optanonCookieString.indexOf(category + ":1") != -1)
    {
        return true;
    }
    return false;
}