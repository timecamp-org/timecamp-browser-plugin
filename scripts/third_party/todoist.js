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

    this.idsTransformedCache = {};

    /*
     * Transforms task id from v2 to v1
     * Todoist start to use v2 ids on their pages and webapi (v9)
     * we need to transform them to v1 to use with rest api (v2)
     */
    this.transformIdV2toIdV1 = async (idv2) => {
        try {
            if (this.idsTransformedCache[idv2]) {
                return this.idsTransformedCache[idv2];
            }

            var storedItem = localStorage.getItem('User');
            if (storedItem) {
                storedItem = JSON.parse(storedItem);

                var token = storedItem.token ?? null;
                if (!token) {
                    return null;
                }

                const response = await fetch('https://api.todoist.com/rest/v2/tasks/' + idv2, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    }
                });

                const body = await response.json();

                const idV1 = body.id;
                if (!idV1) {
                    return null;
                }

                this.idsTransformedCache[idv2] = idV1;

                return idV1;
            }
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    };

    this.getAvailableButtons = async function() {
        var tasks = [];

        //list
        $.each($this.getTasksFromList(), async function (index, id){
            const idV1 = await $this.transformIdV2toIdV1(id);
            const idV2 = id;
            var task = {
                'taskId': 'timecamp-track-button-list-' + idV1,
                'rawId': idV1,
                'location': 'list',
                idV2: idV2,
            };

            tasks.push(task);
        });

        // task page
        var taskPageId = this.getTaskIdFromTaskDetailsPage();
        if (taskPageId) {
            const idV1 = await $this.transformIdV2toIdV1(taskPageId);
            const idV2 = taskPageId;
            var task = {
                'taskId': 'timecamp-track-button-task-page-' + idV1,
                'rawId': idV1,
                'location': 'taskPage',
                idV2: idV2,
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
            return $this.transformIdV2toIdV1(id);
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

        var parent = $this.getTaskParentSelectorByLocation(task.location, task.idV2);
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
