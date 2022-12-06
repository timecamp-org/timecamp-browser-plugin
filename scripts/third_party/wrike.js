function WrikeTimer() {
    Messages.set('synchronizing', 'SYNCING');
    Messages.set('buttonTimerStopTrackingAnotherTask', 'BUTTON_TIMER_STOPPED_SHORT');
    Messages.set('buttonTimerStopped', 'BUTTON_TIMER_STOPPED_SHORT');
    Messages.set('buttonTimerStarted', 'BUTTON_TIMER_STARTED_SHORT');
    this.infoInsertingInProgress = false;
    this.isWatching = this.canWatch.URL;
    var $this = this;
    var isTranslatePending = false;

    this.currentTaskId = function () {
        if (isTranslatePending){
            return null;
        }
        var url = document.URL;

        var taskOpenPattern = /&t=([0-9]+)/ig;
        var taskFromKanbanPattern = /task\/([0-9]+)/ig;

        var MatchRes;
        MatchRes = taskOpenPattern.exec(url);

        console.log("timecamp", MatchRes, url, "match1");

        if (!MatchRes) {
            MatchRes = taskFromKanbanPattern.exec(url);
            console.log("timecamp", MatchRes, url, "match2");
        }
        if (MatchRes) {
            var params = {
                v2_task_id: MatchRes[1],
            };
            isTranslatePending = true;
            $.when(ApiService.getWrikeId.get(params)).then(function () {
                var currentTaskId = params.v2_task_id;
                setTimeout(() =>  {
                    $this.insertButtonIntoPage(currentTaskId);
                }, 3000);
                isTranslatePending = false;
                return currentTaskId;
            });
        }

        return null;
    };

    this.currentTaskName = function () {

        var el = $("#entityname");
        if (el.length)
            return el.html();

        return false;
    };


    this.isButtonInserted = function () {
        if ($('#timecamp-track-button').length > 0) {
            return true;
        }

        if (!this.currentTaskId()) {
            return true;
        }

        if (this.buttonInsertionInProgress) {
            return true;
        }

        return false;
    };

    this.insertButtonIntoPage = function (currentTaskId) {
        if ($('#timecamp-track-button').attr('data-taskid') != currentTaskId){
            $('#timecamp-track-button').remove();
        }

        if ($('.wspace-task-tb-icon-timeTracker')){
            $('.wspace-task-tb-icon-timeTracker').remove();
        }

        if (this.buttonInsertionInProgress === true || $('#timecamp-track-button').length > 0){
            return;
        }
        this.buttonInsertionInProgress = true;
        console.log('timecamp', currentTaskId);
        if (!currentTaskId)
        {
            this.buttonInsertionInProgress = false;
            return;
        }

        var parent = $(".settings-bar");
        $(".modal-body").find("#entityname").css("max-width", "325px");

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

        var button = $('<span/>', { class:'wspace-task-tb-icon-timeTracker', 'id': 'timecamp-track-button', 'data-taskId': currentTaskId , style: 'background:none; padding: 0px 7px;'});
        button.append($('<img id="tc-logo" src="' + chrome.runtime.getURL('images/icon-30.png') + '" style="margin-bottom: -2px; width: 14px;"/>'));
        button.append($('<span/>', { 'class': 'text' }).text(Messages.synchronizing));
        button.append($('<span/>', { 'class': 'time' , 'style':'text-shadow: none;'}).text("00:00").css({}).hide());

        this.button = button;
        buttonObj.uiElement = button;

        button.insertBefore(parent.children().eq(0));

        button.click(function () {
            $this.buttonClick();
        });

        buttonObj.insertInProgress = false;

        $.when(this.updateButtonState()).always(function () {
            $this.buttonInsertionInProgress = false;
        });
    };

    this.onSyncSuccess = function (response) {
        if (this.isTimerRunning) {
            this.trackedTaskId = response.external_task_id;
            if (!this.trackedTaskId)
                return;


            var badges;

            var replaces = ["opp_","project_"];
            var replacement = null;
            var task_id;
            for (var i = 0; i < replaces.length; i++)
            {
                var replace = replaces[i];
                task_id = this.trackedTaskId.replace(replace,'');
                if (task_id != this.trackedTaskId)
                {
                    replacement = replace;
                    break;
                }
            }

            switch (replacement)
            {
                case 'opp_':
                    badges = $("#opportunity-list").find(".link-box [href='/opportunities/details/"+task_id+"']");
                    break;
                case 'project_':
                    badges = $("#project-list").find(".link-box [href='/Projects/Details/"+task_id+"']");
                    break;
                default:
                    badges = $("#taskList").find(".subject [href='/Tasks/TaskDetails/"+task_id+"']");
                    break;
            }

            if (badges.find("#tc-badge").length == 0) {
                var badge = $("#tc-badge");

                if (badge.length > 0)
                    badge.detach();
                else
                    badge = $('<img/>',
                        {
                            id:         "tc-badge",
                            style:      "margin-top: -2px;",
                            src:        chrome.runtime.getURL('images/icon-14.png'),
                            title:      Messages.badgeTimerRunning
                        });
                badges.parent().append(badge);
            }
        }
        else
        {
            this.onSyncFailure();
        }
    };

    this.isInfoInserted = function () {
        if (!this.currentTaskId())
            return true;


        if (this.infoInsertingInProgress)
            return true;

        if ($('#timecamp-track-info').length > 0)
            return true;

        if ($(".entity-detail").find(".property-table").length == 0)
            return true;

        return false;
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
            timecampTrackInfo.html('No time tracked yet');
        else
            timecampTrackInfo.html('You spent ' + $this.getElapsedTime(duration) + ' on this task');
    };

    this.insertInfoIntoPage = function () {
        var taskId = $this.currentTaskId();
        if (!taskId)
            return;

        this.infoInsertingInProgress = true;
        console.log("timecamp", 'Inserting info...');

        var container = $(".entity-detail").find(".property-table").first();


        var tr = $('<tr/>');

        var tdTitle = $('<td/>', {class:'ralign'});
        var tdValue = $('<td/>');
        var title = $('<span />', {class: 'title', html:'TimeCamp'});
        var value = $('<div/>', { 'class': 'info', 'id': 'timecamp-track-info', 'text' : 'No data yet'});
        tdTitle.append(title);

        tdValue.append(value);
        tr.append(tdTitle);
        tr.append(tdValue);
        container.prepend(tr);
        $this.getTrackedTime();

        this.infoInsertingInProgress = false;
    };

    this.onSyncFailure = function () {
        var badge = $("#tc-badge");
        if (badge.length > 0)
            badge.remove();
    };

    this.onTrackingDisabled = function() {
        var button = ButtonList[this.currentTaskId()];
        if (!button || button.denied)
            return;

        var notice = $('<div/>', {'class': 'teamwork-settings-notice',
            'html':'Current settings of the integration in TimeCamp don\'t allow time tracking for this tasks. <a href="https://www.timecamp.com/addons/teamwork/index/'+this.lastParentId+'" target="_blank">Synchronize this project</a> to start tracking time.'});

        button.denied = true;
        button.uiElement.off('click').children().css({'opacity': '0.6'});
        $("#tc-logo").css({'-webkit-filter':'saturate(0%)'});
        $('#TaskContent').find('.taskList').before(notice);
    };

    this.getTrackableId = function() {
        return null;
    };

    this.bindEvents(this);
}

$(document).ready(function () {
    console.log("timecamp", "started wrike");
    WrikeTimer.prototype = new TimerBase();
    timer = new WrikeTimer();
});

Service = "wrike";
