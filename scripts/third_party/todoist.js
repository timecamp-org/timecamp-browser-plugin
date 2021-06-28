function TodoistTimer() {
    Messages.set('synchronizing', 'SYNCING');
    Messages.set('buttonTimerStopped', 'BUTTON_TIMER_STOPPED');
    Messages.set('buttonTimerStarted', 'BUTTON_TIMER_STARTED_SHORT');
    Messages.set('buttonTimerStopping', 'BUTTON_TIMER_STOPPING_SHORT');
    Messages.set('buttonTimerStopTrackingAnotherTask', 'BUTTON_TIMER_STOPPED');

    this.infoInsertingInProgress = false;
    var $this = this;
    $this.isWatching = $this.canWatch.DOM;
    this.multiButton = true;

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

    this.getTasksFromList = function () {
        var listOfIds = [];

        $('.task_list_item').each(function (index, item){
            id = $(item).data('item-id');
            listOfIds.push(id);
        });

        return listOfIds;
    };

    this.getTaskIdFromTaskDetailsPage = function () {
        var id = $('.reactist_modal_box .sub_items_tab_container .items:first-child').first().data('subitemListId');

        if (id === undefined) {
            return false;
        }

        return id;
    };

    this.currentTaskId = function () {
        var id = this.getTaskIdFromTaskDetailsPage();
        if (id) {
            return id;
        }

        return false;
    };

    this.currentTaskName = function () {
        var el = $('.item_detail .task_content span');
        if (el.length){
            return el[0].innerText;
        }

        return false;
    };

    this.isButtonInserted = function (taskId) {
        if ($('#' + taskId).length > 0) {
            return true;
        }

        return false;
    };

    this.insertButtonIntoPage = function (task) {
        this.buttonInsertionInProgress = true;

        var taskId = task.rawId;
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
            this.updateButtonState();
            var args = {
                externalTaskId: currentTaskId,
                taskId: currentTaskId,
                taskName: $this.currentTaskName()
            };
            $this.lastTask = args;
            $(document).trigger('tcTaskChangeDetected', args);
        }
    };

    this.createAndInsertButton = function(buttonObj, task) {
        var addByAppend = true;
        if (task.location === 'list') {
            addByAppend = false;
        }

        var parent = $this.getTaskParentSelectorByLocation(task.location, task.rawId);
        var button = $('<button/>', {
            'class': 'timecamp-track-button timecamp-track-button-' + task.location,
            'id': task.taskId,
            'data-taskId': buttonObj.taskId
        });
        this.button = button;
        if (buttonObj.uiElement === null) {
            buttonObj.uiElement = [];
        }
        buttonObj.uiElement.push(button);

        if (addByAppend) {
            parent.append(button);
        } else {
            parent.prepend(button);
        }

        button.append($('<span/>', { 'class': 'startTrackingIcon fa fa-play' }));
        button.append($('<span/>', { 'class': 'stopTrackingIcon' }));
        button.append($('<span/>', { 'class': 'text' }).text(Messages.buttonTimerStopped));
        button.append($('<span/>', { 'class': 'time' }).text("00:00").hide());
    };

    this.getTaskParentSelectorByLocation = function(location, id) {
        switch (location) {
            case 'list':
                parent =  $('[data-item-id=' + id + ']').find('.task_list_item__actions');
                break;
            case 'taskPage':
                parent = $('.item_detail .item_overview_sub');
                break;
            default:
                return;
        }

        return parent;
    };

    this.bindEvents(this);
}
$(document).ready(function () {
    TodoistTimer.prototype = new TimerBase();
    timer = new TodoistTimer();
});

Service = "todoist";
