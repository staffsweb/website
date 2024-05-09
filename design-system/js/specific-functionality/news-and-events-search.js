var defaultPageSize = 12;
var defaultPageIndex = 0;
var pageIndex = 0
var month;
var year;
var category;
var searchText;
var timer;
var curEntryCount = 0;
var url;

function News(loadMore, redirectPage) {
    url = "/news/";
    var searchText = document.getElementById('news_search').value;
    category = document.getElementById('news_category') !== null ? document.getElementById('news_category').value : "";
    month = document.getElementById('news_month').value;
    year = document.getElementById('news_year').value;
    if (loadMore) {
        LoadMore('news', searchText, category, month, year, 'newsPage')
    }
    else if (!redirectPage) {
        window.location = UrlRedirect(url, year, month, category, searchText);
    }
    else {
        if (year > 0) {
            window.history.pushState("newsPageYear", "news", "/news/" + year);
        }
        if (year > 0 && month > 0) {
            window.history.pushState("newsPageYearMonth", "news", "/news/" + year + "/" + month);
        }
        Search('news', searchText, category, month, year, 'newsPage');
    }
    return false;
}

function Events(loadMore, redirectPage) {
    url = "/events/";
    searchText = document.getElementById('news_search').value;
    category = document.getElementById('news_category').value;
    month = document.getElementById('news_month').value;
    year = document.getElementById('news_year').value;
    if (loadMore) {
        LoadMore('events', searchText, category, month, year, 'eventsPage')
    }
    else if (!redirectPage) {
        window.location = UrlRedirect(url, year, month, category, searchText);
    }
    else {
        if (year > 0) {
            window.history.pushState("eventPageYear", "event", "/events/" + year);
        }
        if (year > 0 && month > 0) {
            window.history.pushState("eventPageYearMonth", "event", "/events/" + year + "/" + month);
        }
        Search('events', searchText, category, month, year, 'eventsPage');
    }
    return false;
}

function UrlRedirect(path, year, month, cat, text) {
    if (year > 0 && month == 0) {
        path = path + year;
    }
    if (year > 0 && month > 0) {
        path = path + year + "/" + month;
    }
    if (cat != "" && cat != "all" && text != "") {
        path = path + "?q=" + text + "&category=" + cat;
    }
    else if (cat == "" && text != "") {
        path = path + "?q=" + text;
    }
    else if (cat != "" && cat != "all" && text == "") {
        path = path + "?category=" + cat;
    }
    return path;
}

function Search(contentTypeId, searchText, category, month, year, elementId) {
    pageIndex = defaultPageIndex;
    curEntryCount = 0;
    var querystring = QueryString(contentTypeId, searchText, category, month, year, pageIndex, defaultPageSize);
    AjaxSearch(querystring, elementId, false);
}

function LoadMore(contentTypeId, searchText, category, month, year, elementId) {
    pageIndex++;
    var querystring = QueryString(contentTypeId, searchText, category, month, year, pageIndex, defaultPageSize);
    AjaxSearch(querystring, elementId, true);
}

function QueryString(contentTypeId, searchText, category, month, year, pageIndex, pageSize, level) {
    var querystring = '';
    if (level != "" || level != null) {
        level = "";
    }

    if (Array.isArray(contentTypeId)) {
        querystring = "/api/SU/Search" +
            "?contentTypeId=" + contentTypeId +
            "&searchText=" + searchText +
            "&category=" + category +
            "&month=" + month +
            "&year=" + year +
            "&pageIndex=" + pageIndex +
            "&pageSize=" + pageSize +
            "&level=" + level;
    }
    else {

        querystring = "/api/SU/Search/" + contentTypeId +
            "?searchText=" + searchText +
            "&category=" + category +
            "&month=" + month +
            "&year=" + year +
            "&pageIndex=" + pageIndex +
            "&pageSize=" + pageSize +
            "&level=" + level;
    }
    return querystring;
}
function AjaxSearch(querystring, elementId, doAppend) {
    var xhttp = new XMLHttpRequest();
    var div = document.getElementById(elementId);
    console.log("ElementId = " + elementId + "; div = " + div);
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            $("#loading").remove();
            if (doAppend) {
                var json = this.response;
                if (json.entries === undefined) {
                    json = JSON.parse(json);
                }
                div.insertAdjacentHTML('beforeend', json.entries);
            }
            else {
                var json = this.response;
                if (json.entries === undefined) {
                    json = JSON.parse(json);
                }
                div.innerHTML = json.entries;
            }
            if (json.entryCount == 0) {
                div.insertAdjacentHTML('beforeend', "<p class='msg msg--noresults large-12 column'>Sorry, no results found. </p>");
                $('.load-more').addClass('visually-hidden');
            }
            curEntryCount = (json.entryCount + curEntryCount);
            if (curEntryCount >= json.totalCount) {
                $('.load-more').addClass('visually-hidden');
            } else {
                //$('.load-more').removeClass('visually-hidden');
            }
        }
    };
    $(div).append("<div id='loading' class='bg loading--bg'><svg id='loadingIcon' style='margin:10px 47%' width='80px' height='80px' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' preserveAspectRatio='xMidYMid' class='uil-default'><rect x='0' y='0' width='100%' height='120' fill='none' class='bk'></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(0 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(30 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.08333333333333333s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(60 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.16666666666666666s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(90 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.25s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(120 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.3333333333333333s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(150 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.4166666666666667s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(180 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.5s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(210 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.5833333333333334s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(240 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.6666666666666666s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(270 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.75s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(300 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.8333333333333334s' repeatCount='indefinite'/></rect><rect  x='46.5' y='40' width='7' height='20' rx='5' ry='5' fill='#003b5c' transform='rotate(330 50 50) translate(0 -30)'>  <animate attributeName='opacity' from='1' to='0' dur='1s' begin='0.9166666666666666s' repeatCount='indefinite'/></rect></svg></div>");
    xhttp.open("POST", querystring, true);
    xhttp.responseType = "json";
    xhttp.send();
}

let newsAndEventsSearchInit = function() {
    $('.js-load-more').on('click', function (e) {
        var $this = $(this);
        var url = $this.data('src');
        var target = $this.data('target');
        var btnHtml = $this.html();
    
        e.preventDefault();
    
        // If the button is not disabled and it has a url
        if (!$this.attr('disabled') && url && target) {
            // Set the button to loading
            $this.attr('disabled', true).addClass('loading').text('Loading...');
    
            $.ajax({
                type: 'GET',
                url: url
            }).success(function (data) {
                var $target = $(target);
                var $lastItem = $target.children('div:last-child');
    
                // Add the data to the target
                $target.append(data);
    
                // TODO: when in contensis check if this is the last page to load, if it is remove the button
                // $this.remove();
    
                // Set the load more button back to normal
                $this.attr('disabled', false).removeClass('loading').html(btnHtml);
    
                // Focus on the first new element
                $lastItem.next().find('a').focus();
    
            }).error(function () {
                $this.removeClass('loading').html('Sorry, no results found.');
            });
        }
    });

    $('#news_search').on('keydown', function (e) {
        if(e.keyCode == 13)
        {
            e.preventDefault();
        }
    });
};