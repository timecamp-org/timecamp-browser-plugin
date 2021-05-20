function HeySpaceTimer() {

    var $this = this;

	Messages.set('buttonTimerStopped', 'BUTTON_TIMER_STOPPED_SHORT');
    Messages.set('buttonTimerStarted', 'BUTTON_TIMER_STARTED_SHORT');
    Messages.set('synchronizing', 'SYNCING');
    Messages.set('buttonTimerStopping', 'BUTTON_TIMER_STOPPING_SHORT');

    this.currentTaskId = function () {
        let name = 'taskId';
        let url = window.location.href;

        name = name.replace(/[\[\]]/g, '\\$&');
        let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);

        if (!results) return null;
        if (!results[2]) return '';

        return 'task_' + decodeURIComponent(results[2].replace(/\+/g, ' '));
    };

    this.currentTaskName = function () {
        if(this.currentTaskId()) {
            let el = document.getElementById(this.currentTaskId());
            if (el) {
                return el.innerHTML;
            }
        }

        return false;
    };

    this.onSyncSuccess = function (response) {
        if (this.isTimerRunning) {
            this.trackedTaskId = response.external_task_id;
            if (!this.trackedTaskId)
                return;
            var badges = $('.list-cards a[href^="/c/' + this.trackedTaskId + '"]').siblings('div.badges');
            if (badges.find("#tc-badge").length == 0) {
                var badge = $("#tc-badge");

                if (badge.length > 0)
                    badge.detach();
                else
                    badge = $('<img/>',
                        {
                            id:         "tc-badge",
                            class:    "badge",
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

        return $('#timecamp-track-button').length != 0;
    };

    this.isInfoInserted = function () {
        if (this.infoInsertingInProgress)
            return true;

        if ($('#timecamp-track-info').length > 0)
            return true;

        if ($('.window-header-inline-content.js-current-list').length == 0)
            return true;

        return false;
    };

    this.insertInfoIntoPage = function () {
        var taskId = $this.currentTaskId();
        if (!taskId)
            return;
        console.log('Inserting Info into page...');
        this.infoInsertingInProgress = true;

        var infoTop = $('.quiet.hide-on-edit.window-header-inline-content.js-current-list');


        var info = $('<span/>', { 'id': 'timecamp-track-info' });
        infoTop.append(info);
        $this.getTrackedTime();
        this.infoInsertingInProgress = false;
    };

    this.insertButtonIntoPage = function () {
        var currentTaskId = $this.currentTaskId();
        if (!currentTaskId)
            return;

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

        this.buttonInsertionInProgress = true;
        var button = $('<button/>', { 'class': 'Component__app-heySpace-components-buttons-SecondaryButton-styles__35jfw object-color-secondary-button-macaroniAndCheeseColor__app-heySpace-styles-productA-object-colors-styles__EQaGw darkButtonShade__app-heySpace-components-buttons-SecondaryButton-styles__1LT6X', 'id': 'timecamp-track-button', 'data-taskId': currentTaskId, 'status': 'unknown' });

        buttonObj.uiElement = button;
        this.button = button;
        button.append($('<img id="tc-logo" src="' + chrome.extension.getURL('images/icon-16.png') + '" />'));
        button.append($('<span/>', { 'class': 'text' }).text(Messages.synchronizing));
        button.append($('<span/>', { 'class': 'time' }).text("00:00").hide());

        $.when(this.updateButtonState())
            .always(function () {
                $this.buttonInsertionInProgress = false;
            });

        var iconsCont = $(".taskProgressWrapper__app-heySpace-components-tasks-taskProgress-TaskStatusAndProgressController-styles__3ycZY");
        iconsCont.append(button);
        buttonObj.insertInProgress = false;
        $(".time").css("color", "white");
    };

    this.onTrackingDisabled = function() {
        var button = ButtonList[$this.currentTaskId()];
        if (!button || button.denied)
            return;

        var link = $('<a/>', {
            class:'quiet-button',
            text:'Integration settings',
            href:'https://www.timecamp.com/addons/heyspace/index/'+this.lastParentId,
            title:'Synchronize tasks to start tracking time.',
            target:'_blank'}
        );

        var p = $('<p/>', {class: 'quiet bottom', id:'tc-integration-link'});

        p.append(link);
        button.denied = true;
        button.uiElement.off('click')
            .addClass('disabled')
            .attr('title','Current settings of the integration don\'t allow time tracking for this tasks. Please use link below to review and change the settings of the integration')
            .after(p);

        $("#timecamp-track-info").hide();
        $("#tc-logo").css({'opacity': '0.7', '-webkit-filter':'saturate(0%)'});
    };

    this.bindEvents(this);
}
$(document).ready(function () {
    HeySpaceTimer.prototype = new TimerBase();
    timer = new HeySpaceTimer();
});


Sidebar.clickBindSelector = ["body"];
Sidebar.appendSelector = "body";

Service = "heyspace";