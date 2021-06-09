/**
 * Created by m.dybizbanski on 22.11.13.
 */
function PodioTimer() {
    var $this = this;

    this.currentTaskId = function () {
        var $html = $('html');

        if ($html.is('.tasks'))
        {
            var MatchRes = document.URL.match(/\/tasks\/([0-9]*)/);
            if (MatchRes)
                return MatchRes[1];
        }

        var share = $('.share');
        if (share.length > 0)
        {
            if (!share.data('id')) {
                return null;
            }

            return  'i'+ share.data('id');
        }

        if ($html.is('.items'))
        {
            var id = $('#wrapper').data('context-id');
            return 'i' + id;
        }

        var parent = $(".preview-panel").find('.item-container');
        if (parent.length > 0)
        {
            return 'i' + parent.data('item-id');
        }

        return null;
    };


    this.getParentId = function() {
        var DOMObj = $("#wrapper");

        var prefix = "";
        switch (DOMObj.attr('data-context-type')) {
            case "space" : prefix = 's'; break;
            case "app" : prefix = 'a'; break;
            case "item" : prefix = 'i'; break;
        }

        var dataContextId = DOMObj.attr('data-context-id');
        if (!dataContextId) {
            return false;
        }

        return prefix + dataContextId;
    };

    this.getSubtasks = function()
    {
        var subtasks = [];

        if ($("body").is('.spaces'))
        {
            var appsList = $("#space-navigation").find('ul.app-list').find('li.app');
            if (appsList.length)
            {
                $.each(appsList, function (key, el) {

                    var subtask = {
                        taskId  : "a"+$(el).attr('data-app-id'),
                        taskName: $(el).find('.title').text()
                    };
                    subtasks.push(subtask);
                });
            }
        }
        else if ($("body").is('.apps'))
        {
            var itemsListBadge = $(".items-list").find('a.badge-component');
            var itemsListActivity = $(".items-list").find('li.object');
            if (itemsListBadge.length)
            {
                $.each(itemsListBadge, function (key, el)
                {
                    var subtask = {
                        taskId: "i"+$(el).attr('data-id'),
                        taskName: $(el).find('.app-badge-header').text()
                    };
                    subtasks.push(subtask);
                });
            }
            else if (itemsListActivity.length) {
                $.each(itemsListActivity, function (key, el)
                {
                    var subtask = {
                        taskId: "i"+$(el).attr('data-ref-id'),
                        taskName: $(el).attr('data-ref-title')
                    };
                    subtasks.push(subtask);
                });
            }

        }

        return subtasks;
    };

    this.currentTaskName = function () {

        var el = $("#taskName"+$this.currentTaskId());
        if (el.length)
            return el.text();

        return false;
    };

    this.onSyncSuccess = function (response) {
        if (this.isTimerRunning) {
            this.trackedTaskId = response.external_task_id;
            if (!this.trackedTaskId)
                return;

            var badges;
            if (this.trackedTaskId.charAt(0) != 'i')
            {
                var permalink = '/tasks/'+this.trackedTaskId;
                badges = $('.task-summary').find('a[href$="'+permalink+'"]');
            }

            if (badges && badges.find("#tc-badge").length == 0) {
                var badge = $("#tc-badge");

                if (badge.length > 0)
                    badge.detach();
                else
                    badge = $('<img/>', {
                        id:         "tc-badge",
                        "class":    "badge",
                        style:      "padding: 1px 4px; height: 14px; vertical-align: text-bottom",
                        src:        chrome.extension.getURL('images/icon-14.png'),
                        title:      Messages.badgeTimerRunning
                    });
                badges.append(badge);
            }
        }
        else
        {
            this.onSyncFailure();
        }
    };

    this.onTrackingDisabled = function () {
       var button = ButtonList[this.currentTaskId()];
       if (!button || button.denied)
           return;
       button.denied = true;

       var notice = $('<div/>', {'style': 'margin-left: 10px;', 'class': 'icon-16 icon-help balloon-visible','title':'Current settings of the integration don\'t allow time tracking for this task. Click the settings icon on the left to change them.'});
       $("#timecamp-track-info").hide().after(notice);
       $("#tc-logo").css({'opacity': '0.5', '-webkit-filter':'saturate(0%)'});
       $("#timecamp-track-button").children('.text').css({'opacity': '0.4'});

    };

    this.onSyncFailure = function () {
        var badge = $("#tc-badge");
        if (badge.length > 0)
            badge.remove();
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

    this.isButtonInserted = function () {
        if (this.buttonInsertionInProgress)
            return true;

        if ($('#timecamp-track-button').length > 0)
            return true;

        return $("#timecamp-container").length == 0;
    };

    this.isInfoInserted = function () {
        if (this.infoInsertingInProgress)
            return true;

        if ($('#timecamp-track-info').length > 0)
            return true;

        if ($('ul.app-fields-list').length == 0  && $('.task-body.fields').length == 0)
            return true;
    };

    this.insertInfoIntoPage = function () {
        var taskId = $this.currentTaskId();
        if (!taskId)
            return;

        this.infoInsertingInProgress = true;
        console.log('Inserting info...');


        var addDiv = false;
        var infoTop = $('ul.app-fields-list');
        if (infoTop.length == 0)
        {
            infoTop = $('.task-body.fields').eq(0);
            addDiv = true;
        }


        var info;
        if (addDiv)
        {
            info = $('<div/>', { 'class': 'field text', 'id': 'timecamp-container'});
            info.append($('<div/>', { 'class': 'label', 'html':'TimeCamp <a href="https://www.timecamp.com/addons/podio/index/'+this.lastTrackableId+'"><span class="icon-16 icon-16-black-wrench"></span></a>' }));

            var wrapper = $('<div/>', { 'class': 'value'});
            wrapper.append($('<div/>', { 'id': 'timecamp-track-info', 'text' : 'No data yet', style:'display: inline-block; margin-left: 10px;' }));

            info.append(wrapper);
        }
        else
        {
            info = $('<li/>', { 'class': 'field text', 'id': 'timecamp-container' });
            var frameWrapper = $('<div/>', { 'class': 'frame-wrapper'});
            var frameLabel = $('<div/>', { 'class': 'frame-label'});
            var frameContent = $('<div/>', { 'class': 'frame-content'});
            var labelContentWrapper = $('<div/>', { 'class': 'label-content-wrapper'});
            var labelContent = $('<div/>', { 'class': 'label-content', 'html':'TimeCamp <a href="https://www.timecamp.com/addons/podio/index/'+this.lastTrackableId+'"><span class="icon-16 icon-16-black-wrench"></span></a>'});
            labelContentWrapper.append(labelContent);
            frameLabel.append(labelContentWrapper);
            frameContent.append($('<div/>', { 'class': 'value', 'id': 'timecamp-track-info', 'text' : 'No data yet', 'style':'margin-left: 10px; display: inline-block;' }));
            frameWrapper.append(frameLabel);
            frameWrapper.append(frameContent);
            info.append(frameWrapper);
        }

        infoTop.prepend(info);
        this.infoInsertingInProgress = false;
    };

    this.insertButtonIntoPage = function () {
        var currentTaskId = $this.currentTaskId();
        if (!currentTaskId)
            return;

        var buttonObj;
        if (ButtonList[currentTaskId]) {
            buttonObj = ButtonList[currentTaskId];
            $this.timerButton = buttonObj;
        }
        else
        {
            var taskName = $this.currentTaskName();
            buttonObj = new TimerButton(currentTaskId, taskName);
            $this.timerButton = buttonObj;
            ButtonList[currentTaskId] = buttonObj;
        }
        buttonObj.insertInProgress = true;

        this.buttonInsertionInProgress = true;
        console.log('Inserting button into page...');
        var button = $('<div/>', {'class': ' tc button-new silver','style':'display: inline-block;'}).width('auto');
        var a = $('<a/>', { 'class': 'button-link', 'id': 'timecamp-track-button', 'data-taskId' : currentTaskId});
        buttonObj.uiElement = a;

        this.button = a;
        button.append(a);
        a.append($('<img src="' + chrome.extension.getURL('images/icon-16.png') + '" id="tc-logo" style="vertical-align:text-bottom;"/>'));
        a.append($('<span/>', { 'class': 'text', 'style':'float: right; margin-left: 5px;' }).text(Messages.synchronizing));
        a.append($('<span/>', { 'class': 'time' }).text("00:00").css({ padding: "0px 2px 2px", 'margin-left': '5px'}).hide());

        var buttonList = $(".preview-panel").find('.action-bar').find('ul').eq(0);
        if (buttonList.length == 0)
            buttonList = $("#timecamp-container").find('.frame-content').eq(0);
        if (buttonList.length == 0)
            buttonList = $("#timecamp-container").find('.value').eq(0);
        buttonList.prepend(button);

        buttonObj.insertInProgress = false;
        $.when(this.updateButtonState())
            .always(function () {
                $this.buttonInsertionInProgress = false;
            });

    };

    this.getTrackableId = function()
    {
        return null;
    };

    this.detectTaskIdChange = function() {
    }

    this.onParentChangeDetected = function() {
    }

    $(document).on('tcTaskChangeDetected', function(event, args) {
        if (!$this.button) {
            return;
        }

        if ($this.timerButton) {
            $this.timerButton.stop();
        }

        if (ButtonList) {
            for (var i in ButtonList) {
                if (ButtonList[i].uiElement) {
                    ButtonList[i].uiElement.parent().remove();
                }

                delete ButtonList[i];
            }
        }
    });

    this.bindEvents(this);
}

$(document).ready(function () {
    PodioTimer.prototype = new TimerBase();
    timer = new PodioTimer();
});

Service = "podio";
