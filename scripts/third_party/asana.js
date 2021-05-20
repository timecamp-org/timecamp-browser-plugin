function AsanaTimer() {

    Messages.set('synchronizing', 'SYNCING');
    Messages.set('buttonTimerStopTrackingAnotherTask', 'BUTTON_TIMER_STOPPED_SHORT');
    Messages.set('buttonTimerStopped', 'BUTTON_TIMER_STOPPED');
    Messages.set('buttonTimerStarted', 'EMPTY_MESSAGE');
    this.infoInsertingInProgress = false;
    this.isWatching = this.canWatch.URL;
    var $this = this;

    this.currentTaskId = function () {
        var url = document.URL;
        var reg = /0\/([0-9]+)\/([0-9]+)/g;
        var MatchRes = reg.exec(url);
        var secondReg = /search\/([0-9]+)\/([0-9]+)/g;
        var secondMatchRes = secondReg.exec(url);
        if (MatchRes && MatchRes.length >= 3) {
            return MatchRes[2];
        }
        else if (secondMatchRes && secondMatchRes.length >= 3) {
            return secondMatchRes[2];
        }
        return null;
    };

    this.getParentId = function() {
        var url = document.URL;
        var reg = /0\/([0-9]+)/g;
        var MatchRes = reg.exec(url);

        if (MatchRes && MatchRes.length >= 2)
            return MatchRes[1];

        return null;
    };

    this.getSubtasks = function() {
        var subtasks = [];

        $('.task-row').each(function(i, el){
            var arr = $(el).attr('id').split('_');
            var taskId = arr[3];

            var taskName = $(el).find('textarea').val();

            var subtask = {
                taskId: taskId,
                taskName: taskName
            };

            subtasks.push(subtask);
        });

        return subtasks;
    };

    this.currentTaskName = function () {

        var el = $("#details_property_sheet_title");
        if (el.length)
            return el.val();

        return false;
    };

    this.insertButtonIntoPage = function () {
        this.buttonInsertionInProgress = true;

        var currentTaskId = $this.currentTaskId();
        if (!currentTaskId)
        {
            this.buttonInsertionInProgress = false;
            return;
        }

        var newVersion = document.querySelectorAll(".SingleTaskPaneToolbarEasyCompletion-leftItems").length > 0;

        var dueDate = $(".property.due_date.flyout-owner").eq(0);
        if (dueDate.css('margin-right') == '7px')
            dueDate.css('margin-right','0px');


        var buttonObj;
        if (ButtonList[currentTaskId])
            buttonObj = ButtonList[currentTaskId];
        else
        {
            var taskName = $this.currentTaskName();
            buttonObj = new TimerButton(currentTaskId, taskName);
            ButtonList[currentTaskId] = buttonObj;
        }
        buttonObj.insertInProgress = true;

        if (newVersion) {
            var div1 = $('<div/>', {'class': 'loading-boundary hidden', 'style': 'margin-left:5px'});
            var button = $('<div/>', { 'id': 'timecamp-track-button-new', 'data-taskId': currentTaskId, 'style':'position:relative' });
        } else {
            var div1 = $('<div/>', {'class': 'loading-boundary hidden'});
            var button = $('<div/>', { 'id': 'timecamp-track-button', 'data-taskId': currentTaskId, 'style':'position:relative' });
        }
        var div2 = $('<div/>', { 'class': 'redesign-timecamp-container'});
        var div3 = $('<div/>', { 'class': 'property tc flyout-owner'});
        var div4 = $('<div/>', { 'class': 'property-name', 'id':'lunaTC' });

        this.button = button;
        div1.append(div2);
        div2.append(div3);
        div3.append(div4);
        div4.append(button);
        button.append($('<span/>', { 'class': 'startTrackingIcon fa fa-play' }));
        button.append($('<span/>', { 'class': 'stopTrackingIcon' }));
        button.append($('<span/>', {'class': 'text'}).text(Messages.synchronizing));
        button.append($('<span/>', {'class': 'time'}).text("00:00").hide());

        var getButtonList = function() {
            var rightPanel = $('#right_pane');
            if (rightPanel.length == 0) {
                rightPanel = $('.SingleTaskPaneModal');
            }
            if (rightPanel.length == 0) {
                rightPanel = $('.SingleTaskPane');
            }
            if (rightPanel.length == 0) {
                rightPanel = $('.SingleTaskPaneSpreadsheet');
            }

            var buttonList = rightPanel.find('.toolbar-section.left').children().eq(1);
            if (buttonList.length == 0) {
                buttonList = rightPanel.find('.SingleTaskPaneToolbar').children().eq(1);
            }
            if (buttonList.length == 0) {
                buttonList = rightPanel.find('.SingleTaskPaneToolbarEasyCompletion-leftItems').children().eq(0);
            }
            return buttonList;
        };

        var insertButton = function() {
            var buttonList = getButtonList();
            if (!buttonList.length) {
                setTimeout(insertButton.bind(this), 300);
                return false;
            }

            div1.insertAfter(buttonList);
            buttonObj.insertInProgress = false;
            buttonObj.uiElement = button;

            $.when(this.updateButtonState()).always(function () {
                $this.buttonInsertionInProgress = false;
            });
        };

        setTimeout(insertButton.bind(this), 0);
    };

    this.onSyncSuccess = function (response) {
        if (response.isTimerRunning) {
            this.trackedTaskId = response.external_task_id;
            if (!this.trackedTaskId)
                return;
            var badges = $("#center_pane__contents").find("#item_row_view_"+ this.trackedTaskId +" .itemRowView-taskMetadata");
            if (badges.find("#tc-badge").length == 0) {
                var badge = $("#tc-badge");

                if (badge.length > 0)
                    badge.detach();
                else
                    badge = $('<img/>',
                        {
                            id:         "tc-badge",
                            style:      "vertical-align: top;",
                            src:        chrome.extension.getURL('images/icon-14.png'),
                            title:      Messages.badgeTimerRunning
                        });
                badges.prepend(badge);
            }
        }
        else
        {
            this.onSyncFailure();
        }
    };

    this.updateTopMessage = function (taskId, duration) {
        if (!$this.isInfoInserted())
            return;
        if (taskId != $this.currentTaskId())
            return;

        if ($this.startDate && $this.trackedTaskId == $this.currentTaskId())
            duration += moment().diff($this.startDate, 'seconds');

        var timecampTrackInfo = $('#timecamp-track-info');
        if (duration == 0)
            timecampTrackInfo.html('');
        else
            timecampTrackInfo.html('You spent ' + $this.getElapsedTime(duration) + ' on this task');
    };

    this.isInfoInserted = function () {
        if (!$this.isTaskSelected())
            return false;

        return this.infoInsertingInProgress || $("#timecamp-track-info").length > 0;
    };

    this.insertInfoIntoPage = function () {
        var taskId = $this.currentTaskId();
        if (!taskId)
            return;

        this.infoInsertingInProgress = true;
        var infoTop = $('#right_pane').find('.small-feed-story-group').eq(0);
        var feedStory = $('<div>', {'class' : 'feed-story'});
        var info = $('<span/>', { 'id': 'timecamp-track-info' });
        feedStory.prepend(info);
        infoTop.prepend(feedStory);

        $this.getTrackedTime();


        this.infoInsertingInProgress = false;
    };

    this.onSyncFailure = function () {
        var badge = $("#tc-badge");
        if (badge.length > 0)
            badge.remove();
    };

    this.isButtonInserted = function () {
        if (this.buttonInsertionInProgress) {
            return true;
        }
        var tcButton = document.querySelectorAll("#timecamp-track-button-new");
        var tcButtonOld = document.querySelectorAll("#timecamp-track-button");
        if(tcButton.length || tcButtonOld.length){ // we have a button
            var button = tcButton.length ? tcButton : tcButtonOld;
            if (button[0].getAttribute('data-taskId') != $this.currentTaskId()) // but we shouldn't have
            {
                $(button).remove();
                return false;
            }
            return true;
        } else {
            return false;
        }
    };

    this.getTrackableId = function () {
        return null;
    };

    this.bindEvents(this);
}

$(document).ready(function () {
    AsanaTimer.prototype = new TimerBase();
    timer = new AsanaTimer();
    timer.timeFetchMethod = timer.timeFetchMethods.FOR_SUBTASKS;
});



Sidebar.cssUpdate = [
    {
        selector: "#asana_full_page",
        property: "margin-left",
        value: "50px"
    }
];
Sidebar.clickBindSelector = ["body"];
Sidebar.appendSelector = "body";
Service = "asana";