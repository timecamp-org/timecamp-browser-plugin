/**
 * Created by mdybizbanski on 14.09.15.
 */
function TimerButton(taskId, taskName, timeFormat) {
    this.taskId     = taskId;
    this.taskName   = taskName;
    this.uiElement  = null;
    this.insertInProgress = true;
    this.enabled    = false;
    this.denied     = false;
    this.startedAt  = null;
    this.intervalId = null;
    this.runningEntryId = false;
    this.isRunning = false;
    this.buttonStartingState = false;
    this.cssClassForRunningTimer = 'timeTrackingActive';
    this.timeFormat = timeFormat;

    var $this = this;

    this.lock = function() {
        if (Array.isArray(this.uiElement)) {
            for (var i = 0; i < this.uiElement.length; i++) {
                this.uiElement[i].attr('disabled', 'disabled');
            }
        } else {
            this.uiElement.attr('disabled', 'disabled');
        }
    };

    this.unlock = function() {
        if (Array.isArray(this.uiElement)) {
            for (var i = 0; i < this.uiElement.length; i++) {
                this.uiElement[i].removeAttr('disabled');
            }
        } else {
            this.uiElement.removeAttr('disabled');
        }
    };

    this.start = function (startDate, entryId) {
        $this.setButtonText(Messages.buttonTimerStarted);
        $this.showTimer();

        if (this.uiElement) {
            if (Array.isArray(this.uiElement)) {
                for (var i = 0; i < this.uiElement.length; i++) {
                    this.uiElement[i].addClass(this.cssClassForRunningTimer);
                }
            } else {
                this.uiElement.addClass(this.cssClassForRunningTimer);
            }
        }

        if ($this.isRunning) {
            return;
        }

        $this.isRunning = true;
        $this.startedAt = startDate;
        $this.runningEntryId = entryId;

        var eventParams = {
            entryId: $this.runningEntryId,
            taskName: $this.taskName,
            taskId: $this.taskId,
            source: 'button'
        };

        $(document).trigger('tcTimerStarted', eventParams);


        var callback = function () {
            var diff = moment().diff($this.startedAt,'seconds');
            $this.setButtonTime(diff);

            var eventParams = {
                elapsed: diff,
                entryId: $this.runningEntryId,
                taskId: $this.taskId
            };

            $(document).trigger('tcTimerTick', eventParams);
        };

        callback();

        $this.intervalId = setInterval(callback, 1000);
    };

    this.stop = function()
    {
        $this.hideTimer();

        if (!$this.isRunning) {
            return;
        }

        $this.isRunning = false;
        clearInterval($this.intervalId);
        $this.intervalId = null;

        var eventParams = {
            entryId: $this.runningEntryId,
            taskName: $this.taskName,
            taskId: $this.taskId,
            source: 'button'
        };

        $(document).trigger('tcTimerStopped', eventParams);
        if (this.uiElement) {
            if (Array.isArray(this.uiElement)) {
                for (var i = 0; i < this.uiElement.length; i++) {
                    this.uiElement[i].removeClass(this.cssClassForRunningTimer);
                }
            } else {
                this.uiElement.removeClass(this.cssClassForRunningTimer);
            }
        }
    };

    this.isEnabled = function ()
    {
        return !this.insertInProgress && this.enabled && !this.denied;
    };

    this.isInserted = function ()
    {
        return $this.insertInProgress || $('#timecamp-track-button-'+$this.taskId).length > 0;
    };

    this.setButtonText = function (text)
    {
        if (!$this.uiElement) {
            return $this;
        }

        if (Array.isArray(this.uiElement)) {
            for (var i = 0; i < this.uiElement.length; i++) {
                $this.uiElement[i].children('.text').html(text);
            }
        } else {
            $this.uiElement.children('.text').html(text);
        }

        return $this;
    };

    this.setButtonTime = function (seconds)
    {
        if (!$this.uiElement) {
            return $this;
        }

        if (this.timeFormat && this.timeFormat === 'classic') {
            var durationFormatted = formatHMSTimer(seconds);
        } else {
            var minutes = Math.floor(seconds / 60);
            seconds = Math.floor((seconds - minutes * 60 ));
            var durationFormatted = zeroFill(minutes, 2) + ':' + zeroFill(seconds, 2);
        }

        if (Array.isArray(this.uiElement)) {
            for (var i = 0; i < this.uiElement.length; i++) {
                $this.uiElement[i].children('.time').html(durationFormatted);
            }
        } else {
            $this.uiElement.children('.time').html(durationFormatted);
        }
        return $this;
    };

    this.hideTimer = function ()
    {
        if (!$this.uiElement) {
            return $this;
        }

        $(document).trigger('hideTimer');

        if (Array.isArray(this.uiElement)) {
            for (var i = 0; i < this.uiElement.length; i++) {
                var ui = $this.uiElement[i].children('.time');
                if (ui.is(':visible')) {
                    ui.hide();
                }
            }
        } else {
            var ui = $this.uiElement.children('.time');
            if (ui.is(':visible')) {
                ui.hide();
            }
        }
        return $this;
    };

    this.showTimer = function ()
    {
        if (!$this.uiElement) {
            return $this;
        }

        $(document).trigger('showTimer');

        if (Array.isArray(this.uiElement)) {
            for (var i = 0; i < this.uiElement.length; i++) {
                var ui = $this.uiElement[i].children('.time');
                if (!ui.is(':visible')) {
                    ui.show();
                }
            }
        } else {
            var ui = $this.uiElement.children('.time');
            if (!ui.is(':visible')) {
                ui.show();
            }
        }

        return $this;
    };

    this.remove = function ()
    {
        if (!$this.uiElement) {
            return $this;
        }

        if (Array.isArray(this.uiElement)) {
            for (var i = 0; i < this.uiElement.length; i++) {
                $this.uiElement[i].remove();
            }
        } else {
            $this.uiElement.remove();
        }
        return $this;
    };
}