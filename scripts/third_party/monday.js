function MondayTimer() {

    Messages.set('synchronizing', 'SYNCING');
    Messages.set('buttonTimerStopTrackingAnotherTask', 'BUTTON_TIMER_STOPPED');
    Messages.set('buttonTimerStopped', 'BUTTON_TIMER_STOPPED');
    Messages.set('buttonTimerStarted', 'EMPTY_MESSAGE');
    this.infoInsertingInProgress = false;
    var $this = this;
    $this.isWatching = $this.canWatch.DOM;
    this.multiButton = true;

    this.createId = function (id) {
        return "monday_" + id
    };

    this.currentTaskId = function () {
        var id = this.getTaskIdFromTaskDetailsPage();
        if (id) {
            return $this.createId(id);
        }

        return false;
    };

    this.getTaskIdFromTaskDetailsPage = function () {
        var url = document.URL;

        var MatchRes = /pulses\/([0-9]+)/g.exec(url);
        if (MatchRes) {
            return MatchRes[1];
        }

        return false;
    };

    this.getTasksFromList = function () {
        var listOfIds = [];

        $('.pulse-component-wrapper').each(function (index, item){
            var id = '';
            var cssId = $(item).find('.pulse-component')[0].id;
            var regexResults = /pulse-([0-9]+)/g.exec(cssId);
            if (regexResults) {
                id = regexResults[1];
            }

            listOfIds.push(id);
        });

        return listOfIds;
    };

    this.currentTaskName = function () {
        var el = $('#slide-panel-container .pulse_title .multiline-ellipsis-component');
        if (el.length) {
            return el.text();
        }

        return false;
    };

    this.onDomModified = function () {
        var buttonsIds = {};
        var tasks = $this.getAvailableButtons();
        for (i in tasks)
        {
            var rawId = tasks[i].rawId;
            var taskId = tasks[i].taskId;
            var buttonId = $this.createId(rawId);
            buttonsIds[buttonId] = buttonId;
            if (!$this.isButtonInserted(taskId, rawId)) {
                $this.insertButtonIntoPage(tasks[i]);
            }

            if ($('#' + taskId).length > 0
                && $('#pulse-' + rawId + ' #timecamp-track-button-list-' + rawId).length === 0
            ) {
                $this.removeOrphansButtons(ButtonList[buttonId]);
            }
        }

        for (buttonId in ButtonList) {
            if (buttonsIds[buttonId] === undefined) {
                $this.removeOrphansButtons(ButtonList[buttonId]);
            }
        }

    };

    this.removeOrphansButtons = function (button) {
        if (Array.isArray(button.uiElement)) {
            for (var i = 0; i < button.uiElement.length; i++) {
                if (button.uiElement[i] !== undefined && button.uiElement[i].hasClass('timecamp-track-button-list')) {
                    button.uiElement[i].remove();
                    button.uiElement.splice(i, 1);
                }
            }
        }
    };

    this.isButtonInserted = function (taskId) {
        if ($('#' + taskId).length > 0) {
            return true;
        }

        return false;
    };

    this.getAvailableButtons = function() {
        var tasks = [];

        //list
        $.each($this.getTasksFromList(), function (index, id){
            var task = {
                'taskId': 'timecamp-track-button-list-' + id,
                'rawId': id,
                'location': 'list',
            };

            tasks.push(task);
        });

        // task page
        var taskPageId = this.getTaskIdFromTaskDetailsPage();
        if (taskPageId) {
            var task = {
                'taskId': 'timecamp-track-button-task-page-' + taskPageId,
                'rawId': taskPageId,
                'location': 'taskPage',
            };

            tasks.push(task);
        }

        return tasks;
    };

    this.insertButtonIntoPage = function (task) {
        this.buttonInsertionInProgress = true;

        var taskId = 'monday_' + task.rawId;
        var buttonObj;
        if (ButtonList[taskId]) {
            buttonObj = ButtonList[taskId];
        } else {
            buttonObj = new TimerButton(taskId);
            buttonObj.uiElement = [];
            ButtonList[taskId] = buttonObj;
        }

        buttonObj.insertInProgress = true;

        var currentTaskName = $this.currentTaskName();
        if (currentTaskName) {
            buttonObj.taskName = currentTaskName;
        }

        $this.createAndInsertButton(buttonObj, task);
        buttonObj.insertInProgress = false;

        var currentTaskId = this.currentTaskId();
        if (currentTaskId) {
            var args = {
                externalTaskId: currentTaskId,
                taskId: currentTaskId,
                taskName: $this.currentTaskName()
            };
            $this.lastTask = args;
            $(document).trigger('tcTaskChangeDetected', args);

            //try update sidebar again if monday did not load data fast enough
            setTimeout(function (t) {
                var currentTaskId = t.currentTaskId();
                var args = {
                    externalTaskId: currentTaskId,
                    taskId: currentTaskId,
                    taskName: t.currentTaskName()
                };
                $this.lastTask = args;
                $(document).trigger('tcTaskChangeDetected', args);
            }, 3000, this);
        }

        var t = this;
        $('.timecamp-track-button').click(function (e) {
            t.__proto__.buttonClick.call(this, e);
            e.stopImmediatePropagation();
        });
    };

    this.createAndInsertButton = function(buttonObj, task) {
        var addByAppend = true;
        if (task.location === 'list') {
            addByAppend = false;
        }

        var parent = $this.getTaskParentSelectorByLocation(task.location, task.rawId);
        if (parent.length === 0) {
            return;
        }

        var button = $('<button/>', {
            'class': 'timecamp-track-button timecamp-track-button-' + task.location,
            'id': task.taskId,
            'data-taskId': buttonObj.taskId
        });
        this.button = button;
        buttonObj.uiElement.push(button);

        if (addByAppend) {
            parent.append(button);
        } else {
            parent.after(button);
        }

        button.append($('<span/>', { 'class': 'startTrackingIcon fa fa-play' }));
        button.append($('<span/>', { 'class': 'stopTrackingIcon' }));
        button.append($('<span/>', { 'class': 'text' }).text(Messages.synchronizing));
        button.append($('<span/>', { 'class': 'time' }).text("00:00").hide());
    };

    this.getTaskParentSelectorByLocation = function(location, id) {
        switch (location) {
            case 'list':
                parent =  $('#pulse-' + id)
                    .not('.pulse-component-light')
                    .not('.pulse-component-placeholder')
                    .find('.name-cell-text');
                break;
            case 'taskPage':
                parent = $('#slide-panel-container').find('.pulse_title');
                break;
            default:
                return;
        }

        return parent;
    };

    this.onEntriesLoaded = function(event, eventData) {
        $this.addTabWithTimeEntries(eventData.data);
    };

    this.addTabWithTimeEntries = function(data) {
        var currentTaskId = $this.currentTaskId();
        var tabClass = 'timecamp-tab-' + currentTaskId;
        var contentTabClass = 'timecamp-tab-content-' + currentTaskId;

        if (!$('.slide-panel .pulse-tabs .' + tabClass).length)  {
            $this.renderTcTab(tabClass);

            var lastContentVisible = null;
            $('.slide-panel .pulse-tabs .tab').on('click', function() {
                if ($(this).hasClass(tabClass)) {
                    //unselect all tabs and hide its content when clicked 'time tracking' tab
                    lastContentVisible = $this.selectTimeTrackingTab(tabClass, contentTabClass, lastContentVisible);
                } else {
                    //unselect 'time tracking' tab when other tab is chosen
                    $this.unselectTimeTrackingTab(tabClass, contentTabClass, lastContentVisible);
                }
            });
        }

        $this.renderAndInsertTabContent(data, tabClass, contentTabClass);
    };

    this.selectTimeTrackingTab = function(tabClass, contentTabClass, lastContentVisible) {
        $('.slide-panel .pulse-tabs .tab').each(function(index, tab) {
            $(tab).removeClass('is-selected');
        });
        $('.slide-panel .pulse_content .tab').each(function(index, tab) {
            if ($(this).hasClass('is-active')) {
                lastContentVisible = $(tab);
                $(tab).removeClass('is-active');
            }
        });

        //select 'time tracking' tab
        $('.' + tabClass).addClass('is-selected');
        $('.' + contentTabClass).addClass('is-active');

        return lastContentVisible;
    };

    this.unselectTimeTrackingTab = function(tabClass, contentTabClass, lastContentVisible) {
        $('.' + tabClass).removeClass('is-selected');
        $('.' + contentTabClass).removeClass('is-active');
        //fix for changing between two tabs many times when one of them is 'time tracking'
        if (lastContentVisible !== null) {
            lastContentVisible.addClass('is-active');
        }
    };

    this.renderAndInsertTabContent = function(data, tabClass, contentTabClass) {
        var tabContentActiveClassIsTabActive = $('.' + tabClass).hasClass('is-selected') ? 'is-active' : '';
        var tabContent =
            '<li class="tab ' + contentTabClass + ' ' + tabContentActiveClassIsTabActive + '">' +
            '<div class="tc-entries">';

        for (var i = 0; i < data.length; i++) {
            tabContent += $this.renderEntry(data[i]);
        }

        if (data.length === 0) {
            tabContent += '<div class="tc-no-entry-info">No tracked time</div>';
        }

        tabContent +=
            '</div>' +
            '</li>'
        ;

        if ($('.' + contentTabClass).length) {
            $('.' + contentTabClass).remove();
        }
        $('.slide-panel .pulse_content').append(tabContent);
    };

    this.renderEntry = function(entry) {
        var duration = $this.getElapsedTime(parseInt(entry.duration));
        return '' +
            '<div class="tc-entry">' +
                '<div class="tc-entry-info">' +
                    '<span class="tc-entry-info-name">' + entry.user_name + '</span>' +
                    '<span class="tc-entry-info-text">tracked</span>' +
                    '<span class="tc-entry-info-duration">' + duration + '</span>' +
                '</div>' +

                '<div class="tc-entry-time">' +
                    '<div class="tc-entry-time-data">' + moment(entry.date).format("D MMM") + '</div>' +
                    '<div class="tc-entry-time-from">' +
                        '<span class="tc-entry-time-decorator">from</span>' +
                        moment(entry.start_time, 'HH:mm:ss').format("HH:mm") +
                    '</div>' +
                    '<div class="tc-entry-time-to">' +
                        '<span class="tc-entry-time-decorator">to</span>' +
                        moment(entry.end_time, 'HH:mm:ss').format("HH:mm") +
                    '</div>' +
                '</div>' +
            '</div>'
        ;
    };

    this.renderTcTab = function(tabClass) {
        $('.slide-panel .pulse-tabs').append(
            $('<li/>', {
                'class': 'tab ' + tabClass,
                'text': 'Tracked time'
            })
        );
    };


    this.bindEvents(this);
}

$(document).ready(function () {
    MondayTimer.prototype = new TimerBase();
    timer = new MondayTimer();
});

Sidebar.cssUpdate = [
    {
        selector: "body",
        property: "padding-left",
        value: "50px"
    },
    {
        selector: "#boards-drawer .boards-drawer",
        property: "margin-left",
        value: "50px"
    }
];
Sidebar.clickBindSelector = ["#main"];
Sidebar.appendSelector = "#main";

Service = "monday";
