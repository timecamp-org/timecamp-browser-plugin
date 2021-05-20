/// <reference path="../jquery-2.0.3.js" />
/// <reference path="../chrome-api-vsdoc.js" />
/// <reference path="common.js" />
function refreshPopup(loggedIn, statusText, statusFlag)
{

    chrome.tabs.query({
        "active": true,
        "currentWindow": true,
        "status": "complete",
        "windowType": "normal"
    }, function (tabs) {
        for (tab in tabs) {
            var a = document.createElement('a');
            a.href = tabs[tab].url;
            if (a.hostname == 'app.hey.space') {
                $("#displaySidebarOption").hide();
                break;
            }
        }
    });

    if (statusText != null) {
        $("#status").show().text(statusText);
        if (statusFlag == 'error') {
            $("#status").addClass('error');
        } else {
            $("#status").removeClass('error');
        }
    }

    if (loggedIn) {
        $("#logged-out").hide();
        $("#logged-in").show();
    } else {
        TokenManager.getStoredToken().done(function () {
            $("#logged-out").hide();
            $("#logged-in").show();
        }).fail(function () {
            $("#logged-in").hide();
            $("#logged-out").show();
        });
    }
}

$(document).ready(function () {

    $('#displaySidebarCheckbox').unbind('click').click(function () {
        toggleSidebarEnabled($(this).is(":checked"));
        refreshPopup(null, chrome.i18n.getMessage("PLEASE_REFRESH"));
    });

    chrome.storage.sync.get({"isSidebarEnabled": true}, function (items)
    {
        if (!items['isSidebarEnabled'])
            $('#displaySidebarCheckbox').removeAttr('checked');
        else
            $('#displaySidebarCheckbox').attr('checked','checked');
    });

    $("#login-form").submit(function (event) {
        event.preventDefault();
        var data = $(this).serializeArray().reduce(function(obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {});

        chrome.runtime.sendMessage({
            type: "logIn",
            login: data.email,
            password: data.pass_hash,
        }, function (isLoggedIn) {
            if (isLoggedIn === true) {
                refreshPopup(true, chrome.i18n.getMessage("STATUS_SUCCESS"));
            } else {
                refreshPopup(false, chrome.i18n.getMessage("LOG_IN_ERROR"), 'error');
            }
        });
    });

    $("#log-out").click(function () {
        chrome.runtime.sendMessage({
            type: "logOut",
        }, function (response) {
            refreshPopup(false, chrome.i18n.getMessage("STATUS_SUCCESS"));
        });
    });

    refreshPopup();
});

chrome.runtime.onMessage.addListener(
    function(request) {
        if (request.popup) {
            refreshPopup(request.popup.loggedIn, request.popup.statusText, request.popup.statusFlag);
        }
    }
);