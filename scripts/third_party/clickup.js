function ClickupTimer () {
    var $this = this;
    this.isSidebarEnabled = false;
    this.timeFormat = 'classic';

    Messages.set('buttonTimerStopped', 'BUTTON_TIMER_STOPPED');
    Messages.set('buttonTimerStopTrackingAnotherTask', 'BUTTON_TIMER_STOPPED');

    Messages.set('buttonTimerStarted', 'EMPTY_MESSAGE');
    Messages.set('buttonTimerStopping', 'BUTTON_TIMER_STOPPED');
    Messages.set('buttonTimerStarting', 'BUTTON_TIMER_STOPPED');

    this.currentTaskId = function () {
        var url = document.URL;
        var lastUrlSegmentStartIndex = url.lastIndexOf('/') + 1;
        var taskId = url.substring(lastUrlSegmentStartIndex);
        return "task_" + taskId;
    };

    this.isCurrentUrlMatchingTaskUrl = function () {
        var url = document.URL;
        var taskUrlRegex = new RegExp('^https:\/\/app\.clickup\.com\/t.*');
        return taskUrlRegex.test(url);
    };

    this.onSyncSuccess = function (response) {
        if (this.isTimerRunning) {
            this.trackedTaskId = response.external_task_id;
            if (!this.trackedTaskId){
                return;
            }
            this.appendBadges();
        } else {
            this.onSyncFailure();
        }
    };

    this.appendBadges = function() {
        var badges = $('.list-cards a[href^="/c/' + this.trackedTaskId + '"]').siblings('div.badges');
        if (badges.find("#tc-badge").length == 0) {
            var badge = $("#tc-badge");

            if (badge.length > 0) {
                badge.detach();
            } else {
                badge = $('<img/>',
                    {
                        id: "tc-badge",
                        class: "badge",
                        src: chrome.extension.getURL('images/icon-14.png'),
                        title: Messages.badgeTimerRunning
                    });
            }
            badges.append(badge);
        }
    };

    this.isButtonInserted = function() {
        if (this.buttonInsertionInProgress) {
            return true;
        }
        return $('#timecamp-track-button').length > 0;
    };

    this.insertButtonIntoPage = function () {
        if (!this.isCurrentUrlMatchingTaskUrl()) {
            return;
        }

        var currentTaskId = $this.currentTaskId();
        if (!currentTaskId)
            return;

        if (this.buttonInsertionInProgress === true) {
            return;
        }

        var buttonObj;
        if (ButtonList[currentTaskId])
            buttonObj = ButtonList[currentTaskId];
        else
        {
            var taskName = $this.currentTaskName();
            buttonObj = new TimerButton(currentTaskId, taskName, this.timeFormat);
            ButtonList[currentTaskId] = buttonObj;
        }

        buttonObj.insertInProgress = true;
        this.buttonInsertionInProgress = true;

        var button = this.createClickupTimerButton();
        buttonObj.uiElement = button;
        this.button = button;

        $.when(this.updateButtonState())
            .always(function () {
                $this.buttonInsertionInProgress = false;
            });

        var clickupUserTaskHeaderSection = $('.task__toolbar').find('.cu-task-header__section')[0];
        $(button).insertAfter(clickupUserTaskHeaderSection);
        buttonObj.insertInProgress = false;

    };

    this.createClickupTimerButton = function()
    {
        var button = $('<a/>', { 'class': 'button-link', 'id': 'timecamp-track-button', 'data-taskId': this.currentTaskId(), 'status': 'unknown' });
        button.append($('<i class="fa fa-play">'));
        button.append($('<i class="fa fa-stop">').hide());
        button.append($('<span/>', { 'class': 'text' }).text(Messages.buttonTimerStopped));
        button.append($('<span/>', { 'class': 'time' }).text("00:00").hide());
        return button;
    };

    this.clearEntriesContainer = function ()
    {
        $('.tc-entries-container').html('');
        $('.tc-entries-container').remove();
    };

    this.onEntriesLoaded = function(event, eventData)
    {
        $this.clearEntriesContainer();

        var clickupTaskHistoryItem = $('.cu-task-history-item');
        var lastTaskHistoryItem = clickupTaskHistoryItem.last();
        var entriesContainer = $('<div class="tc-entries-container"></div>');

        entriesContainer.insertAfter(lastTaskHistoryItem);
        $this.renderEntries(eventData.data);
    };

    this.renderEntries = function(entries)
    {
        var entriesContainer = $('.tc-entries-container');
        for (var i = 0; i < entries.length; i++)
        {
            var entry = entries[i];
            var entryItem = this.renderEntryItem(entry);

            entriesContainer.append(entryItem);
        }
    };

    this.renderEntryItem = function(entry)
    {
        var formattedDuration = convertToTimesheetDurationFormat(entry.duration);
        var timesheetEntryDateLink = $this.createLinkToTimesheetDay(entry.date, formattedDuration);

        var entryItem =
            '<cu-task-history-item class="cu-task-history-item ng-star-inserted">' +
            '<div class="task-history-item ng-star-inserted">' +
            '<div class="task-history-item__content">' +
            '<span class="task-history-item__name task-history-item__name_btn me ng-star-inserted">You </span>' +
            '<span class="task-history-item__changed-name-description">tracked </span>' +
            timesheetEntryDateLink +
            '</div>' +
            '<div class="task-history-item__date">' +
            moment(entry.date).format("MMM D") +
            ' at ' +
            moment(entry.end_time_formatted, "HH:mm").format("h:mm a") +
            '</div>' +
            '</div>' +
            '</cu-task-history-item>';

        return entryItem;
    };

    this.createLinkToTimesheetDay = function (date, anchorText)
    {
        var link = serverUrl + 'app#/timesheets/timer/' + date;
        var htmlLink = '<a href=' + '"' + link + '" target="_blank">' + anchorText + '</a>';
        return htmlLink;
    };

    this.handleShowTimer = function()
    {
        $this.button.css('background', '#ff3c00');
        $this.button.find('.text').css('display','none');
        $this.button.find('.fa-play').css('display','none');
        $this.button.find('.fa-stop').css('display','inline-block');
    };

    this.handleHideTimer = function ()
    {
        $this.button.find('.fa-stop').css('display','none');
        $this.button.find('.fa-play').css('display','inline-block');
        $this.button.find('.text').css('display','inline-block');
        $this.button.css('background', '#4bb063');
    };

    this.bindEvents(this);
}



$(document).ready(function () {
    ClickupTimer.prototype = new TimerBase();
    timer = new ClickupTimer();
});

Sidebar.clickBindSelector = ["body"];
Sidebar.appendSelector = "body";

Service = "clickup";
