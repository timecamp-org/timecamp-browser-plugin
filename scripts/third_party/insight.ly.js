function InsightlyTimer() {

    Messages.set('synchronizing', 'SYNCING');
    Messages.set('buttonTimerStopTrackingAnotherTask', 'BUTTON_TIMER_STOPPED_SHORT');
    Messages.set('buttonTimerStopped', 'BUTTON_TIMER_STOPPED_SHORT');
    Messages.set('buttonTimerStarted', 'BUTTON_TIMER_STARTED_SHORT');
    this.infoInsertingInProgress = false;
    this.isWatching = this.canWatch.DOM;
    var $this = this;

    this.currentTaskId = function () {
        var url = document.URL;

        var tasksPattern = /Tasks\/TaskDetails\/([0-9]+)/ig;
        var projectsPattern = /Projects\/Details\/([0-9]+)/ig;
        var leadsPattern = /Leads\/Details\/([0-9]+)/ig;
        var contactsPattern = /Contacts\/Details\/([0-9]+)/ig;
        var opportunitiesPattern = /opportunities\/details\/([0-9]+)/ig;
        var organizationsPattern = /Organisations\/details\/([0-9]+)/ig;

        var MatchRes;

        MatchRes = tasksPattern.exec(url);
        if (MatchRes) {
            return MatchRes[1];
        }

        MatchRes = projectsPattern.exec(url);
        if (MatchRes) {
            return "project_" + MatchRes[1];
        }

        MatchRes = opportunitiesPattern.exec(url);
        if (MatchRes) {
            return "opp_" + MatchRes[1];
        }

        MatchRes = leadsPattern.exec(url);
        if (MatchRes) {
            return "lead_" + MatchRes[1];
        }

        MatchRes = contactsPattern.exec(url);
        if (MatchRes) {
            return "contact_" + MatchRes[1];
        }

        MatchRes = organizationsPattern.exec(url);
        if (MatchRes) {
            return "organisation_" + MatchRes[1];
        }

        return null;
    };

    this.getParentId = function() {
        var url = document.URL;
        var reg = /\.insight\.ly\/([A-Za-z]+)/g;
        var MatchRes = reg.exec(url);

        if (MatchRes)
        {
            var parent =MatchRes[1];

            if (parent == 'tasks')
                timer.timeFetchMethod = timer.timeFetchMethods.FOR_SUBTASKS;
            else
                timer.timeFetchMethod = timer.timeFetchMethods.FOR_PARENT;

            return parent;
        }

        return null;
    };

    function findNonTasks() {
        var result = [];
        var parentName = $this.getParentId();
        var find = new RegExp("/"+parentName+"/details/", "gi");
        var links = $('a.noselect[href]').filter(function()
        {
            if (this.href.toLowerCase().search(find) == -1)
                return false;

            if ($(this).text().trim() == "")
                return false;
            return true;
        });

        if (links.length)
        {
            var prefix = "";

            switch (parentName.toLowerCase())
            {
                case "leads": prefix = "lead_"; break;
                case "contacts":    prefix = "contact_"; break;
                case "organisations":    prefix = "organisation_"; break;
                case "projects":    prefix = "project_"; break;
                case "opportunities":    prefix = "opp_"; break;
            }

            $.each(links, function(key, el)
            {
                var reg = new RegExp("/"+parentName+"/details/([0-9]+)","gi");
                var matchRes = reg.exec($(el).attr("href").toLowerCase());
                if (!matchRes)
                    return;

                var taskId = matchRes[1];
                var taskName = $(el).text();

                var subtask = {
                    taskId: prefix+taskId,
                    taskName: taskName,
                    DOMObj: el
                };
                result.push(subtask);
            });
        }

        return result;
    }

    function findTasks() {
        var result = [];
        var links = $(".subject a");

        if (links.length)
        {
            $.each(links, function(key, el)
            {
                var reg = new RegExp("taskdetails/([0-9]+)","gi");
                var matchRes = reg.exec($(el).attr("href").toLowerCase());
                if (!matchRes)
                    return;

                var taskId = matchRes[1];
                var taskName = $(el).text();

                var subtask = {
                    taskId: taskId,
                    taskName: taskName,
                    DOMObj: el
                };
                result.push(subtask);
            });
        }

        return result;
    }
    this.getSubtasks = function() {

        var listContent = $('#list-content');
        var taskListContent = $('#tasklist-content');

        var subtasks = [];

        if (listContent.length)
            subtasks = findNonTasks();
        else if(taskListContent.length)
            subtasks = findTasks();

        return subtasks;
    };

    this.currentTaskName = function () {

        var el = $("#entityname");
        if (el.length)
            return el.html();

        return false;
    };


    this.isButtonInserted = function () {
        if (!this.currentTaskId()) {
            return true;
        }

        if (this.buttonInsertionInProgress) {
            return true;
        }

        if ($('#timecamp-track-button').length > 0) {
            return true;
        }

        return $('#content').find('[class^="header-toolbar"] .btn-toolbar').length == 0;
    };

    this.insertButtonIntoPage = function () {
        this.buttonInsertionInProgress = true;
        console.log('Inserting button into page...');
        var currentTaskId = $this.currentTaskId();
        if (!currentTaskId)
        {
            this.buttonInsertionInProgress = false;
            return;
        }

        var parent = $('#content').find('[class^="header-toolbar"] .btn-toolbar');

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

        var containter = $('<div/>',{class:'btn-group'});
        var button = $('<button/>', { class:'btn btn-default', 'id': 'timecamp-track-button', 'data-taskId': currentTaskId });
        button.append($('<img id="tc-logo" src="' + chrome.runtime.getURL('images/icon-14.png') + '"/>'));
        button.append($('<span/>', { 'class': 'text' }).text(Messages.synchronizing));
        button.append($('<span/>', { 'class': 'time' }).text("00:00").css({}).hide());

        this.button = button;
        buttonObj.uiElement = button;

        containter.append(button);
        containter.insertBefore(parent.find('.btn-group.pull-right').eq(0));

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
        console.log('Inserting info...');

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
    InsightlyTimer.prototype = new TimerBase();
    timer = new InsightlyTimer();
});

Service = "insightly";
