/**
 * Created by mdybizbanski on 14.09.15.
 */

function TimerBase() {
    this.buttonInsertionInProgress = false;
    this.infoInsertingInProgress = false;
    this.pushInterval = 30000;
    this.isTimerRunning = false;
    this.trackedTaskId = "";
    this.button = null;
    this.startDate = null;
    this.multiButton = false;
    this.trackableParents = false;
    this.lastParentTask = null;
    this.lastTask = null;
    this.lastUrl = '';
    this.me = null;

    var $this = this;

    this.canWatch = {'DOM': 0,'URL': 1, 'HISTORY': 2, 'LOAD': 3};
    this.timeFetchMethods = {'FOR_SUBTASKS': 0 , "FOR_PARENT": 1};
    this.timeFetchMethod = this.timeFetchMethods.FOR_PARENT;
    this.isWatching = this.canWatch.DOM;

    this.currentTaskId          = function () { return ''; };
    this.isTaskSelected         = function () { return !!$this.currentTaskId() };
    this.currentTaskName        = function () { return false; };
    this.isParentSelected       = function () { return !!$this.getParentId() };
    this.getSubtasks            = function () { return [] };
    this.onSyncSuccess          = function (response) {};
    this.onSyncFailure          = function (reason) {};
    this.insertButtonIntoPage   = function () {};
    this.insertInfoIntoPage     = function () {};
    this.updateTopMessage       = function (taskId, duration) {};
    this.getAvailableButtons    = function () {};
    this.onTrackingDisabled     = function () {};

    this.isButtonInserted       = function () {
        return true;
    };

    function parentsEquals(newParent, oldParent)
    {
        if (newParent.taskId != oldParent.taskId)
            return false;

        if (!newParent.subtasks.length)
            return true;

        if (newParent.subtasks.length != oldParent.subtasks.length)
            return false;

        return true;
    }

    function tasksEquals(TaskA, TaskB)
    {
        if (TaskA.taskId != TaskB.taskId)
            return false;

        if (TaskA.taskName != TaskB.taskName)
            return false;

        return true;
    }

    this.isInfoInserted = function () {
        return true;
    };

    this.getParentId = function() {
        return false;
    };

    this.canTrack = function () {
        var trackable = this.getTrackableId();
        if (!trackable || !this.trackableParents)
            return true;

        if (this.trackableParents == 'all')
            return true;

        if (this.trackableParents.indexOf(trackable) !== -1)
            return true;

        return false;
    };

    var storage = {
        entries: {}
    };

    this.buttonClick = function (e)
    {
        if (e) {
            e.stopPropagation();
        }

        var params = $(this).data('params');
        if (!params)
            params = {};

        var taskId = $(this).attr('data-taskId');
        if (!taskId)
            taskId = params.taskId;

        if (!taskId)
            return;

        var button;
        if (!ButtonList[taskId])
        {
            button = new TimerButton(taskId);
            if (Service == "podio" && timer) {
                timer.timerButton = button;
            }
            button.enabled = true;
            button.insertInProgress = false;
        }
        else
            button = ButtonList[taskId];

        if (params.taskName)
            button.taskName = params.taskName;

        button.enabled = false;

        var always = function() {
            $this.updateButtonState();
            if (Service != "podio") {
                $this.getEntries(taskId, true);
            }
        };

        var now = moment().format("YYYY-MM-DD HH:mm:ss");
        if ($this.isTimerRunning && $this.trackedTaskId == taskId)
        {
            button.hideTimer().setButtonText(Messages.buttonTimerStopping);
            $.when(ApiService.Timer.stop(now)).then(function () {
                button.stop();
                always();
            });
        }
        else if(button.buttonStartingState == false) //don't allow second request to start when request to start is still in progress
        {
            button.setButtonText(Messages.buttonTimerStarting);
            button.buttonStartingState = true;
            button.lock();
            $.when(ApiService.Timer.start(taskId, now)).then(function (data) {
                button.buttonStartingState = false;
                button.start(now, data.entry_id);
                always();
            }).fail(function () {
                button.buttonStartingState = false;
            }).done(() => { button.unlock(); });
        }
        ButtonList[taskId] = button;
    };

    this.detectTaskIdChange = function()
    {
        var args;

        if (!$this.isTaskSelected())
        {
            if (!$this.isParentSelected())
            {
                if ($this.lastTask || $this.lastParentTask)
                    $(document).trigger('tcNothingSelected');

                $this.lastTask = null;
                $this.lastParentTask = null;
                return;
            }
            args = {
                externalParentId: $this.getParentId(),
                subtasks: $this.getSubtasks()
            };

            if ($this.lastParentTask && parentsEquals(args, $this.lastParentTask))
                return;

            $(document).trigger('tcParentChangeDetected', args);
            $this.lastParentTask = args;
            $this.lastTask = null;
            return;
        }

        var currentTaskId = $this.currentTaskId();
        args = {
            externalTaskId: currentTaskId,
            taskId: currentTaskId,
            taskName: $this.currentTaskName()
        };

        if ($this.lastTask && tasksEquals(args, $this.lastTask))
            return;

        $this.lastTask = args;
        $this.lastParentTask = null;
        $(document).trigger('tcTaskChangeDetected', args);
    };

    this.onDomModified = function () {
        if ($this.multiButton)
        {
            var tasks = $this.getAvailableButtons();
            for (i in tasks)
            {
                if (!$this.isButtonInserted(tasks[i].taskId)) {
                    $this.insertButtonIntoPage(tasks[i]);
                }
            }
        }
        else
        {
            if ($('#timecamp-track-button').length == 0)
            {
                if (!$this.isButtonInserted()) {
                    $this.insertButtonIntoPage();
                }
            }
            if (!$this.isInfoInserted()) {
                $this.insertInfoIntoPage();
            }

            if (!$this.canTrack()) {
                $this.onTrackingDisabled();
            }

            setTimeout(function() {
                $this.detectTaskIdChange();
            });
        }
    };

    this.updateButtonState = function () {
        for (var i in ButtonList) {
            if(ButtonList[i].buttonStartingState == true) {
                return; //don't allow GET status when request to start is still in progress
            }
        }

        $.when(ApiService.Timer.status()).then(function (response) {
            if (response == null)
                return;

            $this.onSyncSuccess(response);

            for (var i in ButtonList)
                ButtonList[i].enabled = true;

            if(!response.isTimerRunning) {
                for (var i in ButtonList)
                {
                    ButtonList[i].stop();
                    ButtonList[i].setButtonText(Messages.buttonTimerStopped);
                }
            }
            else
            {
                $this.trackedTaskId = response.external_task_id;
                $this.startDate = moment(response.start_time);

                if (!ButtonList[$this.trackedTaskId])
                {
                    var button = new TimerButton($this.trackedTaskId);
                    if (Service == "podio" && timer) {
                        timer.timerButton = button;
                    }
                    button.enabled = true;
                    button.insertInProgress = false;
                    button.taskName = response.name;
                    ButtonList[$this.trackedTaskId] = button;
                    if (Service != "podio") {
                        $this.getEntries($this.trackedTaskId, false, false);
                    }
                }

                for (var i in ButtonList)
                {
                    if ($this.trackedTaskId != i) {
                        ButtonList[i].setButtonText(Messages.buttonTimerStopTrackingAnotherTask);
                        if (Service != "podio") {
                            ButtonList[i].stop();
                        }
                    }
                    else
                        ButtonList[i].start($this.startDate, response.entry_id);
                }
                if ($this.isButtonInserted()) {
                    $(document).trigger('showTimer');
                }
            }

            $this.isTimerRunning = response.isTimerRunning;
        }).fail(function (reason) {
            $this.onSyncFailure(reason);

            TokenManager.getLoggedOutFlag().done(function(loggedOut){
                if (loggedOut) {
                    for (var i in ButtonList)
                        ButtonList[i].setButtonText(Messages.buttonLogIn);
                } else {
                    var responseText = (reason.responseText || reason.statusText);
                    var response = reason.status + " - " + responseText;

                    if(errorLogNoticeCounter == 0 && !(responseText == undefined && reason.status == undefined)) {
                        if((reason.responseText && reason.responseText.charAt(0) == '{')
                            || (reason.statusText && reason.statusText.charAt(0) == '{')) {
                        } else if (response && response.indexOf("authentication") == -1) {
                            chrome.runtime.sendMessage(
                                {
                                    id: "errorLog",
                                    response: response
                                }
                            );
                        }
                    }

                    var buttonText = Messages.buttonConnectionError;
                    if(errorLogNoticeCounter == 0 && reason.responseText && reason.responseText.charAt(0) == '{') {
                        buttonText = reason.responseText;
                    }
                    for (var i in ButtonList)
                        ButtonList[i].setButtonText(buttonText);

                    errorLogNoticeCounter++;
                }
            });
        });
    };

    this.onEntriesLoaded = function(event, eventData)
    {
        var params = eventData.params;
        var data   = eventData.data;

        if (params.with_subtasks)
            return;

        var total = 0;
        for (i in data)
            total += parseInt(data[i].duration, 10);

        var taskId = params.external_task_id;
        $this.updateTopMessage(taskId, total);
    };

    this.getEntries = function(taskId, forceReload, with_subtasks)
    {
        with_subtasks = !!with_subtasks;

        if (!taskId || taskId == "")
            return;

        var params = {
            from : '2012-01-01',
            to   : moment().format('YYYY-MM-DD'),
            user_ids: "me",
            external_task_id: taskId,
            with_subtasks: with_subtasks
        };

        if (storage.entries.hasOwnProperty(taskId) && !forceReload)
        {
            $(document).trigger('tcEntriesLoaded', {params: params, data: storage.entries[taskId]});
            return;
        }

        $.when(ApiService.Entries.get(params)).then(function (data) {
            if (data.lenght)
                data.reverse();
            storage.entries[taskId] = data;
            $(document).trigger('tcEntriesLoaded', {params: params, data: data});
        });
    };

    this.getTrackedTime = function()
    {
        var taskId = $this.currentTaskId();
        $this.getEntries(taskId);
    };

    this.getElapsedTime = function (timeInSeconds)
    {
        var duration = moment.duration(timeInSeconds, 'seconds');
        var time = {
            hours : Math.round(duration.hours() + (duration.days() * 24)),
            minutes : Math.round(duration.minutes()),
            seconds : Math.round(duration.seconds())
        };

        if(time.hours   > 0){   return time.hours   + 'h'+(time.hours == 1 ? '' : '')+' '     + time.minutes  + 'min'+(time.minutes == 1 ? '' : '');}
        if(time.minutes > 0){   return time.minutes + 'min'+(time.minutes == 1 ? '' : '');}

        return time.seconds + 'sec';
    };

    this.URLWatcher = function ()
    {
        var url = document.URL;

        if (url != $this.lastUrl || ButtonList.length == 0)
        {
            $this.lastUrl = url;

            var event;

            if (document.createEvent) {
                event = document.createEvent("HTMLEvents");
                event.initEvent("TCURLChanged", true, true);
            } else {
                event = document.createEventObject();
                event.eventType = "TCURLChanged";
            }

            event.eventName = "TCURLChanged";

            if (document.createEvent) {
                document.dispatchEvent(event);
            } else {
                document.fireEvent("on" + event.eventType, event);
            }
        }
    };
    this.onParentChangeDetected = function(event, eventData) {
        if ($this.timeFetchMethod == $this.timeFetchMethods.FOR_SUBTASKS && eventData.subtasks)
        {
            var ids = [];
            for (i in eventData.subtasks)
            {
                var sub = eventData.subtasks[i];
                ids.push(sub.taskId);
            }

            if (ids.length)
                $this.getEntries(ids.join(','), false, true);
        }
        else if ($this.timeFetchMethod == $this.timeFetchMethods.FOR_PARENT)
            $this.getEntries(eventData.externalParentId, false, true);
    };

    this.onTaskChangeDetected = function(event, eventData) {
        if (eventData.externalTaskId)
            $this.getEntries(eventData.externalTaskId);
    };

    this.onDatasetChange = function(event, eventData) {
        var source = eventData.source;
        var refType = eventData.refType;
        var refId = eventData.refId;
        var data = eventData.data;

        if (source == "timer")
            return;

        if (refType == 'entry')
        {
            var taskId = eventData.parentId;
            for (i in storage['entries'][taskId])
            {
                var entry = storage['entries'][taskId][i];
                if (entry['id'] == refId)
                {
                    $.extend(storage['entries'][taskId][i], data);
                    return;
                }

            }
        }
    };
    this.addEventListenerToElement = function (event, selector, callback) {
        const timerId = setInterval(() => {
          const element = document.querySelector(selector);
          if (!element) return;
          clearInterval(timerId);
          element.addEventListener(event, callback);
        });
      };
    this.bindEvents = function ($that) {
        $this = $that;
        setInterval($this.updateButtonState, $this.pushInterval);
        setTimeout($this.updateButtonState, 3000);
        $(document).on('tcEntriesLoaded',$this.onEntriesLoaded);
        $(document).on('tcDatasetChange',$this.onDatasetChange);
        $(document).on('tcTaskChangeDetected',$this.onTaskChangeDetected);
        $(document).on('tcParentChangeDetected',$this.onParentChangeDetected);
        $(document).on('tcTimerStarted', $this.onTimerStarted);
        $(document).on('tcTimerStopped', $this.onTimerStopped);
        $this.addEventListenerToElement('click','.timecamp-track-button',$this.buttonClick)
        $this.addEventListenerToElement('click','#timecamp-track-button',$this.buttonClick)
        $this.addEventListenerToElement('click','#timecamp-track-button-new',$this.buttonClick)
        $(document).on('showTimer', $this.handleShowTimer);
        $(document).on('hideTimer', $this.handleHideTimer);

        switch ($this.isWatching)
        {
            case $this.canWatch.DOM:
                document.addEventListener("DOMNodeInserted", function() {
                    if ($this.DOMChangeTimeout)
                    {
                        clearTimeout($this.DOMChangeTimeout)
                    }
                    $this.DOMChangeTimeout = setTimeout($this.onDomModified, 100);
                });
                break;
            case $this.canWatch.URL:
                setInterval($this.URLWatcher, 100);
                document.addEventListener("TCURLChanged", function() {
                    setTimeout($this.onDomModified, 100)
                });
                break;
            case $this.canWatch.HISTORY:
                window.addEventListener("popstate", function(){
                    setTimeout($this.onDomModified, 20)
                });

                window.addEventListener("historyPushState", function(){
                    setTimeout($this.onDomModified, 20)
                });
                break;
        }

        $.when(TokenManager.getToken()).then(function (token)
        {
            $.when(ApiService.me.get()).then(function (data) {
                $this.me = data;

                if(customDomain[data.root_group_id]) {
                    restUrl = restUrl.replace(serverUrl, customDomain[data.root_group_id]);
                    tokenUrl = tokenUrl.replace(serverUrl, customDomain[data.root_group_id]);
                    signInUrl = signInUrl.replace(serverUrl, customDomain[data.root_group_id]);
                    accessUrl = accessUrl.replace(serverUrl, customDomain[data.root_group_id]);
                    serverUrl = customDomain[data.root_group_id];
                }

                $(document).trigger('tcMeLoaded', {params: {}, data: data});
            });

            var params = {
                url: restUrl+'/can_track/format/json',
                data: {
                    service: Service,
                },
                headers: {"Authorization": "Bearer " + token},
                type: 'GET'
            };

            chrome.runtime.sendMessage(
                {
                    id: "canTrack",
                    params: params
                },
                function(response) {
                    if (typeof response !== "undefined" && typeof response.resolve !== "undefined"
                        && response.resolve === true
                    ) {
                        $this.trackableParents = response.data['trackable_parents'];
                    } else {
                        $this.trackableParents = false;
                    }
                }
            );
        });
    };

    this.getTrackableId = function () {
        return null;
    };
}
