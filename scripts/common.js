if(!String.prototype.linkify) {
    String.prototype.linkify = function() {

        // http://, https://, ftp://
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

        // www. sans http:// or https://
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

        // Email addresses
        var emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;

        return this
            .replace(urlPattern, '<a target="_blank" href="$&">$&</a>')
            .replace(pseudoUrlPattern, '$1<a target="_blank" href="http://$2">$2</a>')
            .replace(emailAddressPattern, '<a target="_blank" href="mailto:$&">$&</a>');
    };
}

function bench(name)
{
    console.log(name, +moment());
}

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

if (!String.format) {
    String.format = function(format) {
        var args = Array.prototype.slice.call(arguments, 1);
        return format.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined'
                ? args[number]
                : ''
                ;
        });
    };

    String.prototype.format = function()
    {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(this);
        return String.format.apply(this, args);
    }
}

var getAccessurl = function (redirect_url) {
    var internalUrl = encodeURIComponent(chrome.runtime.getURL(redirect_url));
    return accessUrl + '?redirect_url=' + internalUrl;
};


function zeroFill(number, width) {
    width -= number.toString().length;
    if (width > 0) {
        return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
    }
    return number + ""; // always return a string
}

function formatHMS(seconds)
{
    var duration = moment.duration(seconds, 'seconds');
    return (duration.hours() + (duration.days() * 24)) + ":" + zeroFill(duration.minutes(), 2) + ":" + zeroFill(duration.seconds(), 2);
}

function formatHMSObj(seconds)
{
    var duration = moment.duration(seconds, 'seconds');

    return {
        hours: duration.hours() + (duration.days() * 24),
        minutes: zeroFill(duration.minutes(), 2),
        seconds: zeroFill(duration.seconds(), 2)
    };
}

function formatHMSTimer(seconds)
{
    var duration = moment.duration(seconds, 'seconds');

    var hours = duration.hours() > 0 ? duration.hours() + 'h ' : '';
    var minutes = duration.minutes() > 0 ? duration.minutes() + 'm ' : '';
    var seconds = duration.seconds() > 0 ? duration.seconds() + 's ' : '';
    return hours + minutes + seconds;
}

/**
 *
 * Function converting string/int seconds to timesheet format duration string
 *
 * @param seconds
 * @returns {string}
 */
function convertToTimesheetDurationFormat(seconds)
{
    var durationFormatted = '';
    var duration = parseInt(seconds);

    if (duration < 60) {
        durationFormatted = duration + 's';
    } else if (duration < 3600) {
        var momentDuration = moment.duration(duration, 'seconds');
        var minutes = momentDuration.minutes();
        var seconds = momentDuration.seconds();

        seconds = addLeadingZero(seconds);
        durationFormatted = minutes + 'm ' + seconds + 's ';

    } else if (duration >= 3600) {
        var durationRounded = Math.round(duration/60);
        var momentDurationRounded = moment.duration(durationRounded, 'minutes');
        var hours = momentDurationRounded.hours();
        var minutes = momentDurationRounded.minutes();

        minutes = addLeadingZero(minutes);
        durationFormatted = hours + 'h ' + minutes + 'm ';
    }
    return durationFormatted;
}

function addLeadingZero(value)
{
    if (value < 10) {
        value = '0' + value;
    }
    return value;
}

$(document).ready(function() {
    $.ajaxSetup({
        beforeSend: function(request) {
            request.setRequestHeader("Accept", "application/json");
        }
    });
});

Messages = {
    buttonTimerStopping                 : chrome.i18n.getMessage('BUTTON_TIMER_STOPPING'),
    buttonTimerStarting                 : chrome.i18n.getMessage('BUTTON_TIMER_STARTING'),
    buttonTimerStopTrackingAnotherTask  : chrome.i18n.getMessage('BUTTON_TIMER_STOP_TRACKING_ANOTHER_TASK'),
    buttonTimerStarted                  : chrome.i18n.getMessage('BUTTON_TIMER_STARTED'),
    buttonTimerStopped                  : chrome.i18n.getMessage('BUTTON_TIMER_STOPPED'),
    buttonLogIn                         : chrome.i18n.getMessage('BUTTON_LOG_IN'),
    buttonConnectionError               : chrome.i18n.getMessage('BUTTON_CONNECTION_ERROR'),
    synchronizing                       : chrome.i18n.getMessage('SYNCHRONIZING'),
    badgeTimerRunning                   : chrome.i18n.getMessage('BADGE_TIMER_RUNNING'),
    pleaseRefresh                       : chrome.i18n.getMessage('PLEASE_REFRESH'),
    set: function (key, value) {
        Messages[key] = chrome.i18n.getMessage(value);
    }
};

var TokenManager    = new TokenManager();
var ApiService      = new ApiService();
var ButtonList      = {};
var Service         = "ChromePlugin";

$.when(TokenManager.getToken()).then(function (token) {ApiService.setToken(token);});
