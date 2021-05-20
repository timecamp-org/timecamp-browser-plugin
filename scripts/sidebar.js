
/**
 * Created by mdybizbanski on 22.09.15.
 */
function Sidebar()
{
    this.appendSelector = null;
    this.sidebar = null;
    this.barChartSelector = '#tcBarChart';
    this.chartEntries = [];
    this.clickBindSelector = [];
    this.cssUpdate = [];
    this.isReady = false;
    this.isCollapsed = true;
    this.templates = {
        "sidebarStartButton":"start_button",
        "sidebarPickButton" :"pick_button",
        "sidebarMain"       :"main",
        "sidebarFooter"     :"footer",
        "sidebarDayHeader"  :"day_header",
        "sidebarTotalTime"  :"total_time",
        "sidebarEntry"      :"entry",
        "sidebarAddEntry"   :"add_entry",
        "sidebarMultiEntry" :"multi_entry",
        "sidebarPlaceholder":"placeholder",
        "sidebarPleaseSelect":"please_select"
    };
    this.isSidebarEnabled = false;

    this.startButton = {
        taskName: false,
        taskId: false
    };

    this.pickButton = {
        hasRecent: false,
        recent: [],
        hasSubtasks: false,
        subtasks: []
    };

    this.isRunning = false;
    this.eventStore = {};
    this.currentTaskId = false;

    this.sidebarFooter = { invoicingEnabled: false };

    $this = this;

    var hoverTimerId = null;
    var mouseoutTimerId = null;
    var chart;

    function pushRecentTask(taskId, taskName)
    {
        if (!taskId || !taskName)
            return;

        var found = false;
        var recentList = $this.pickButton.recent;
        for (i in recentList)
        {
            var entry = recentList[i];
            if (entry.taskId == taskId)
            {
                var sub = recentList.splice(i, 1);
                recentList.splice(0, 0, sub[0]);
                found = true;
                break;
            }
        }

        if (!found)
            recentList.push({taskId: taskId, taskName: taskName});

        recentList.slice(0, 4);

        $this.pickButton.hasRecent = recentList.length > 0;
        $this.pickButton.recent = recentList;

        var rStorage = {};
        rStorage["recentTasks_"+Service] = recentList;
        chrome.storage.sync.set(rStorage);
    }

    function clearEntriesBox() {
        $('.tc-sidebar-time-details').html('');
        $('.tc-sidebar-total-time').remove();
    }

    function calculateDuration(row) {
        var startHour = parseInt(row.find('.from.hours').val(), 10);
        var endHour = parseInt(row.find('.to.hours').val(), 10);

        var startMinutes = parseInt(row.find('.from.minutes').val(), 10);
        var endMinutes = parseInt(row.find('.to.minutes').val(), 10);

        var hDiff = endHour - startHour;
        var mDiff = endMinutes - startMinutes;

        return result = hDiff * 3600 + mDiff * 60;
    }

    this.bindInternalEvents = function()
    {
        $.each($this.clickBindSelector, function (key, el) { $(el).on('click', $this.collapse); });

        $this.sidebar.on('mouseleave', $this.onMouseOut);
        $this.sidebar.on('click',       $this.onSidebarClick);

        $this.sidebar.on('click',       '.update-entry-confirm',    $this.onEntryUpdateConfirm);
        $this.sidebar.on('click',       '.update-entry-cancel',     $this.onEntryUpdateCancel);
        $this.sidebar.on('click',       '.add-entry-confirm',       $this.onEntryAddConfirm);
        $this.sidebar.on('click',       '.add-entry-cancel',        $this.onEntryAddCancel);
        $this.sidebar.on('click',       '.add-time',                $this.onAddTimeClick);
        $this.sidebar.on('click',       '.tc-sidebar-entry-single', $this.onEntryClick);
        $this.sidebar.on('click',       '#tc-sidebar-pick-button',  $this.onPickerClick);
        $this.sidebar.on('click',       '#tc-sidebar-start-button', $this.onStartClick);
        $this.sidebar.on('click',       '.billable-checkbox',       $this.onBillableClick);
        $this.sidebar.on('click',       '.tc-subtask-picker-entry', $this.onTaskSelected);
        $this.sidebar.on('mouseenter',  '.tc-sidebar-scrollable',   $this.onHover);
        $this.sidebar.on('DOMMouseScroll mousewheel', '.tc-sidebar-scrollable', $this.onSidebarScroll);

        $this.sidebar.on('click',       '.note-placeholder a',                  function(e) { e.stopPropagation(); });
        $this.sidebar.on('click',       '.tc-subtask-picker-list-header',       function(e) { e.stopPropagation(); });
        $this.sidebar.on('mouseenter',  '.tc-sidebar-header',                   function(e) { e.stopPropagation(); });
    };

    this.onPickerClick = function() {
        $this.sidebar.find('.tc-subtask-picker').toggle();
        if ($this.isCollapsed)
            $this.expand();
    };

    this.onSidebarScroll = function (ev)
    {
        var $this = $('.tc-sidebar-scrollable'),
            scrollTop = $this[0].scrollTop,
            scrollHeight = $this[0].scrollHeight,
            height = $this.height(),
            delta = (ev.type == 'DOMMouseScroll' ?
                     ev.originalEvent.detail * -40 :
                     ev.originalEvent.wheelDelta),
            up = delta > 0;

        var prevent = function() {
            ev.stopPropagation();
            ev.preventDefault();
            ev.returnValue = false;
            return false;
        };

        if (!up && -delta > scrollHeight - height - scrollTop) {
            // Scrolling down, but this will take us past the bottom.
            $this.scrollTop(scrollHeight);
            return prevent();
        } else if (up && delta > scrollTop) {
            // Scrolling up, but this will take us past the top.
            $this.scrollTop(0);
            return prevent();
        }
    };

    this.onStartClick = function() {
        var baseFA = ($this.isRunning ? '.fa-stop' : '.fa-play');
        $this.sidebar.find(baseFA).removeClass(baseFA).addClass('fa-spinner').addClass('fa-spin');
    };

    this.onAddTimeClick = function(e) {
        e.stopPropagation();

        var DOMObj = $(this);
        DOMObj.hide();

        var date = DOMObj.attr('data-date');
        var container = DOMObj.parents('.tc-sidebar-day-header');
        var newRow = ich.sidebarAddEntry({date: date});

        function makeTimePicker(input){
            if (input.is('.minutes'))
                input.val(moment().format("mm"));
            else
                input.val(moment().format("HH"));


            input.on('focus', function() {
                var element = $(this);
                setTimeout(function() {element.select();});
            });
            input.on('keyup', function(event) {
                if (event.keyCode == 9)
                    event.preventDefault();

                var max = parseInt($(this).attr('max'), 10);
                var min = parseInt($(this).attr('min'), 10);
                var val = parseInt($(this).val(), 10);

                if (val > max)
                    $(this).val(max);

                if (val < min)
                    $(this).val(min);

                if ($(this).val().length == 2)
                    $(this).next().focus();

                var duration = calculateDuration(newRow);
                if (duration < 0)
                {
                    newRow.find('.time-input').addClass("invalid");
                    newRow.find('.btn-success').attr('disabled','disabled');
                }
                else
                {
                    newRow.find('.time-input').removeClass("invalid");
                    newRow.find('.btn-success').removeAttr('disabled');
                    newRow.find('.duration').html(formatHMS(duration));
                }
            })
        }

        var elements = newRow.find('.time-input');
        $.each(elements, function (key, input)
        {
            makeTimePicker($(input));
        });

        var dateElement = newRow.find('.date-input');
        dateElement.datepicker(
            {
                dateFormat: "dd M, yy",
                onSelect: function() { $(this).change(); }
            });
        dateElement.datepicker("setDate", moment(date).format("DD MMM, YYYY"));
        dateElement.on('change', function () { moment($(this).val(), "DD MMM, YYYY").isValid() ? $(this).removeClass('invalid') : $(this).addClass('invalid');});
        dateElement.on('click', function (e) {e.stopPropagation()});
        container.on('click', function (e) {e.stopPropagation()});
        container.after(newRow);
    };

    this.onTaskSelected = function() {
        var DOMObj = $(this);
        var taskId = DOMObj.attr('data-taskId');
        var taskName = DOMObj.text();

        var args = {
            externalTaskId: taskId,
            taskName: taskName
        };

        pushRecentTask(taskId, taskName);

        $(document).trigger('tcTaskChangeDetected', args);
    };

    this.onBillableClick = function(e) {
        e.stopPropagation();

        var value = $(this).is(':checked');
        var DOMObj = $(this).parents('.tc-sidebar-entry');
        var entry = DOMObj.data('entry');
        var entryDiff = {billable: value};

        $.extend(entry, entryDiff);

        ApiService.Entries.put({id: entry.id, billable: value});
        var eventData = {
            refType: "entry",
            refId: entry.id,
            parentType: "task",
            parentId: $this.currentTaskId,
            data: entryDiff,
            source: "sidebar"
        };

        $(document).trigger('tcDatasetChange', eventData);
    };

    function expandEntry(DOMObj)
    {
        DOMObj.addClass('active');
        DOMObj.find('.note-placeholder').addClass('hidden');
        DOMObj.find('.note-input-box').removeClass('hidden');
    }

    function collapseEntry(DOMObj, placeholder)
    {
        if (placeholder)
            DOMObj.find('.note-placeholder').html(placeholder);

        DOMObj.find('.note-placeholder').removeClass('hidden');
        DOMObj.find('.note-input-box').addClass('hidden');
        DOMObj.removeClass('active');
    }

    this.onEntryAddConfirm = function (e)
    {
        e.stopPropagation();

        var DOMObj = $(this);
        if (DOMObj.is('[disabled]'))
            return;

        var container = DOMObj.parents('.tc-sidebar-entry-new');

        var taskId = $this.currentTaskId;
        var duration = calculateDuration(container);

        if (duration <= 0)
            return;

        var date = container.find('.date-input').val();
        var description = container.find('textarea').val();
        var billable = container.find('.new-billable-checkbox').is(":checked");
        var startTime = container.find('.from.hours').val()+":"+container.find('.from.minutes').val();
        var endTime = container.find('.to.hours').val()+":"+container.find('.to.minutes').val();

        var parsedDate = moment(date, "DD MMM, YYYY");

        if (!parsedDate.isValid())
        {
            container.find('.date-input').addClass('invalid');
            return;
        }

        var data = {
            external_task_id: taskId,
            duration: duration,
            date: parsedDate.format('YYYY-MM-DD'),
            description: description,
            billable: billable,
            start_time: startTime,
            end_time: endTime
        };


        DOMObj.attr('disabled', 'disabled').html('Loading ...');
        $.when(ApiService.Entries.post(data)).then(function() {timer.getEntries(taskId, true, false)});

    };

    this.onEntryAddCancel = function (e)
    {
        var DOMObj = $(this).parents('.tc-sidebar-entry-new');
        DOMObj.prev(".tc-sidebar-day-header").find('.add-time').show();
        DOMObj.remove();

        e.stopPropagation();
    };

    this.onEntryClick = function(e)
    {
        var DOMObj = $(this);
        expandEntry(DOMObj);
        e.stopPropagation();
    };

    this.onEntryUpdateConfirm = function(e) {
        var DOMObj = $(this).parents('.tc-sidebar-entry');
        var entry = DOMObj.data('entry');

        var note = DOMObj.find('textarea').eq(0).val();
        var linkify = note.linkify();
        collapseEntry(DOMObj, linkify);

        if (note == entry.description)
            return;

        var entryDiff = {
            description: note,
            description_formatted: linkify
        };

        $.extend(entry, entryDiff);

        ApiService.Entries.put({id: entry.id, description: note});

        var eventData = {
            refType: "entry",
            refId: entry.id,
            parentId: $this.currentTaskId,
            data: entryDiff,
            source: "sidebar"
        };

        $(document).trigger('tcDatasetChange', eventData);
        e.stopPropagation();
    };

    this.onEntryUpdateCancel = function(e) {
        var DOMObj = $(this).parents('.tc-sidebar-entry');
        collapseEntry(DOMObj);
        e.stopPropagation();
    };

    this.watch = function()
    {
        if (!$this.isSidebarEnabled)
            return;
        if (!$this.appendSelector)
            return null;

        var appendObj = $($this.appendSelector);
        if (appendObj.length == 0)
            return null;


        for (i in $this.cssUpdate)
        {
            var cssUpdate = $this.cssUpdate[i];
            var el = $(cssUpdate.selector);

            if (el.length && el.css(cssUpdate.property) != cssUpdate.value)
                    el.css(cssUpdate.property, cssUpdate.value);
        }

        if (!$this.sidebar)
        {
            $this.sidebarMain =  ich.sidebarMain($this.templateData);
            $this.sidebar = $this.sidebarMain.find('.tc-sidebar');
            $this.renderFooter();
            $this.bindInternalEvents();

            var storageDefaults = {};
            storageDefaults["recentTasks_"+Service] = [];
            chrome.storage.sync.get(storageDefaults, function (items) {
                var recent = items["recentTasks_"+Service];
                if (!recent)
                    recent = [];

                $this.pickButton.recent = recent;
                $this.pickButton.hasRecent = recent.length > 0;
            });
        }

        if (!$.contains(document.documentElement, $this.sidebarMain[0]))
        {
            appendObj.prepend($this.sidebarMain);
            if ($this.eventStore['onEntriesLoaded'] != null)
            {
                $this.onEntriesLoaded(null, $this.eventStore['onEntriesLoaded']);
                $this.eventStore['onEntriesLoaded'] = null;
            }

            if (!$this.isSingleTask)
                $this.renderSidebarPickButton();
            else
                $this.renderSidebarStartButton();
        }
    };

    this.renderFooter =  function(params) {
        if (!params)
            params = {};
        var templateData = $.extend(true, {}, $this.sidebarFooter, params);
        var content = ich.sidebarFooter(templateData);
        $('.tc-sidebar-footer').html(content);
    };

    this.renderSidebarStartButton =  function(params) {
        if (!this.isSidebarEnabled) {
            return;
        }

        if (!params) {
            params = {};
        }
        var templateData = $.extend(true, {}, $this.startButton, params, {isRunning: $this.isRunning});
        var content = ich.sidebarStartButton(templateData);
        content.data('params',templateData);
        $('.tc-sidebar-button-box').html(content);
        if($this.isRunning) {
            $this.sidebar.find('.tc-sidebar-header').removeClass('stopped').addClass('running');
        } else {
            $this.sidebar.find('.tc-sidebar-header').removeClass('running').addClass('stopped');
        }
    };

    this.renderSidebarPickButton =  function(params) {
        if (!params)
            params = {};
        var templateData = $.extend(true, {}, $this.pickButton, params);
        templateData.isEmpty = !(templateData.hasSubtasks || templateData.hasRecent);
        var content = ich.sidebarPickButton(templateData);
        $('.tc-sidebar-button-box').html(content);
    };

    this.bindEvents = function()
    {
        $(document).on('tcMeLoaded', $this.onMeLoaded);
        $(document).on('tcTimerStarted', $this.onTimerStarted);
        $(document).on('tcTimerStopped', $this.onTimerStopped);
        $(document).on('tcTimerTick', $this.onTimerTick);
        $(document).on('tcTaskChangeDetected', $this.onTaskChange);
        $(document).on('tcParentChangeDetected', $this.onParentChange);
        $(document).on('tcNothingSelected', $this.onNothingSelected);
        $(document).on('tcEntriesLoaded', $this.onEntriesLoaded);
    };
    this.onMeLoaded = function(event, eventData) {
        $this.sidebarFooter.invoicingEnabled = eventData['data']['permissions']['can_view_rates'];
        $this.renderFooter();
    };

    this.onTimerTick = function(event, eventData) {
        if (!$this.isSidebarEnabled)
            return;

        var taskId = eventData.taskId;
        var entryId = eventData.entryId;
        var elapsed = eventData.elapsed;

        if (taskId != $this.startButton.taskId)
            return;

        var entryElement = $this.sidebar.find('[data-entryid="'+entryId+'"]');

        if (!entryElement.length)
            return;

        var entry = entryElement.data('entry');
        var newDuration = parseInt(entry.duration,10) + elapsed;

        entryElement.find('.duration').html(formatHMS(newDuration));

        var totalTimeObj = $('.tc-sidebar-total-time');

        if (!totalTimeObj.length)
            return;

        var totalTimeVal = parseInt(totalTimeObj.data('totalTime'), 10);
        $this.renderTotalTime(totalTimeVal, elapsed, taskId);

        var tmpEntries = JSON.parse(JSON.stringify($this.chartEntries));
        for (var i in tmpEntries)
        {
            if (tmpEntries[i].id == entryId)
            {
                tmpEntries[i].duration = parseInt(tmpEntries[i].duration, 10) + elapsed;
                break;
            }
        }


        if(chart)
            chart.destroy();

        var dataset = ChartService.prepareDataset('bar', tmpEntries);
        chart = ChartService.renderChart($this.barChartSelector, 'bar', dataset);
    };

    this.renderEntriesDay = function(entries, date, isFirst, isSingleTask) {
        var params = {
            date: moment(date,'YYYY-MM-DD').format("DD MMM"),
            rawDate: date,
            isFirst: isFirst,
            showAddTime:  isSingleTask
        };

        var sidebarTimeDetails = $('.tc-sidebar-time-details');
        sidebarTimeDetails.append(ich.sidebarDayHeader(params));

        for (i in entries)
        {
            var entry = entries[i];
            var render;
            if (isSingleTask)
                render = ich.sidebarEntry(entry);
            else
                render = ich.sidebarMultiEntry(entry);

            render.data('entry', entry);
            sidebarTimeDetails.append(render);
        }
    };

    this.renderTotalTime = function(totalTime, elapsed, taskId) {
        $('.tc-sidebar-total-time').remove();
        var sidebarFooter = $('.tc-sidebar-footer');

        var params = {
            totalTime   : formatHMSObj(totalTime + elapsed),
            taskId      : taskId
        };

        var DOMObj = ich.sidebarTotalTime(params);
        DOMObj.data('totalTime', totalTime);
        sidebarFooter.before(DOMObj);
    };


    function processSingleTask(entries, params)
    {
        var entriesByDays = {};
        var totalTime = 0;
        $this.chartEntries = entries;

        var dataset = ChartService.prepareDataset('bar', $this.chartEntries);
        chart = ChartService.renderChart($this.barChartSelector, 'bar', dataset);

        for (i in entries)
        {
            var entry = entries[i];

            if (entry.description == "")
                entry.description_formatted = "Note...";
            else
                entry.description_formatted = entry.description.linkify();
            entry.isBillable = entry.billable == 1;
            entry.start_time_formatted = entry.start_time.substr(0, 5);
            entry.end_time_formatted = entry.end_time.substr(0, 5);

            var duration = moment.duration(parseInt(entry.duration, 10), 'seconds');
            entry.duration_formatted = formatHMSObj(parseInt(entry.duration, 10));
            entry.isBillable = entry.billable == 1;
            if (!entriesByDays[entry['date']])
                entriesByDays[entry['date']] = [];

            entriesByDays[entry['date']].push(entry);
            totalTime += parseInt(entry['duration'], 10);
        }

        var first = true;
        var days = Object.keys(entriesByDays).reverse();
        for (i in days)
        {
            var day = days[i];

            entriesByDays[day].sort(function (a, b)
            {
                if (a.start_time > b.start_time) return -1;
                return 1;
            });
            $this.renderEntriesDay(entriesByDays[day], day, first, true);
            first = false;
        }
        $this.renderTotalTime(totalTime, 0, params.external_task_id);
    }

    function processMultiTask(entries, params)
    {
        var row;
        var entriesByDays = {};
        var totalTime = 0;
        $this.chartEntries = entries;



        for (i in entries)
        {
            var entry = entries[i];
            var date = entry.date;
            var taskId = entry.task_id;
            var idx = -1;

            if (!entriesByDays[date])
                entriesByDays[date] = [];

            for (j in entriesByDays[date])
            {
                if (entriesByDays[date][j].taskId == taskId)
                {
                    idx = j;
                    break;
                }
            }

            if (idx == -1)
            {
                row = {
                    name: entry.name,
                    duration: parseInt(entry.duration, 10),
                    taskId: taskId
                };
                row.duration_formatted = formatHMSObj(row.duration);
                entriesByDays[date].push(row);
            }
            else
            {
                entriesByDays[date][idx].duration += parseInt(entry.duration, 10);
                entriesByDays[date][idx].duration_formatted = formatHMSObj(entriesByDays[date][idx].duration);
            }
            totalTime += parseInt(entry['duration'], 10);
        }

        var days = Object.keys(entriesByDays).reverse();
        for (i in days)
        {
            var day = days[i];
            entriesByDays[day].sort(function (a, b)
            {
                if (a.duration > b.duration) return -1;
                return 1;
            });
            $this.renderEntriesDay(entriesByDays[day], day, false, false);
        }
        $this.renderTotalTime(totalTime, 0, params.external_task_id);

        var dataset = ChartService.prepareDataset('pie', $this.chartEntries);
        chart = ChartService.renderChart($this.barChartSelector, 'pie', dataset);
    }

    this.onEntriesLoaded = function(event, eventData) {

        var params = eventData.params;
        var entries = eventData.data;

        if (!$this.sidebar)
        {
            $this.eventStore['onEntriesLoaded'] = eventData;
            return;
        }

        if ($this.isRunning && params.external_task_id != $this.currentTaskId)
        {
            $this.eventStore['onEntriesLoaded'] = eventData;
            return;
        }

        if (chart)
            chart.destroy();

        clearEntriesBox();

        if (entries.length == 0)
        {
            $('.tc-sidebar-time-details').append(ich.sidebarPlaceholder());
            return;
        }

        if (!params.with_subtasks)
            processSingleTask(entries, params);
        else
            processMultiTask(entries, params);
    };

    this.onMouseOut = function ()
    {
        let out = true;

        $(".tc-sidebar input").each(function(){
            if($(this).is(":focus")) {
                out = false;
                return;
            }
        });
        if (out) {
            $(".tc-sidebar textarea").each(function () {
                if ($(this).is(":focus")) {
                    out = false;
                    return;
                }
            });
        }

        if (out) {
            mouseoutTimerId = setTimeout($this.collapse, 400);
            clearTimeout(hoverTimerId);
            hoverTimerId = null;
        }
    };

    this.onHover = function ()
    {
        hoverTimerId = setTimeout($this.expand, 300);
        clearTimeout(mouseoutTimerId);
        mouseoutTimerId = null;
    };

    this.onTaskChange = function(event, args)
    {
        var buttonData = JSON.parse(JSON.stringify($this.startButton));

        $this.isSingleTask = true;
        if (args['taskName'])
            buttonData.taskName = args['taskName'];
        else
            buttonData.taskName = false;

        if (args['externalTaskId'])
            buttonData.taskId = args['externalTaskId'];
        else
            buttonData.taskId = false;

        if ($this.isRunning)
        {
            $this.eventStore['onTaskChange'] = buttonData;
            return;
        }

        $this.currentTaskId = buttonData.taskId;
        $this.startButton = buttonData;
        $this.renderSidebarStartButton();
    };

    this.onNothingSelected = function(event)
    {
        if ($this.isRunning)
        {
            $this.eventStore['onTaskChange'] = {hasSubtasks: false};
            return;
        }


        if (chart)
            chart.destroy();

        clearEntriesBox();
        $this.renderSidebarPickButton({hasSubtasks: false});
        $('.tc-sidebar-time-details').append(ich.sidebarPleaseSelect());
    };

    this.onParentChange = function(event, args)
    {
        var buttonData = JSON.parse(JSON.stringify($this.pickButton));

        $this.isSingleTask = false;
        if (args['subtasks'])
            buttonData.subtasks = args['subtasks'];
        else
            buttonData.subtasks = [];
        buttonData.hasSubtasks = buttonData.subtasks.length > 0;

        buttonData.taskId = args['externalParentId'];
        buttonData.taskName = "Select task";

        if ($this.isRunning)
        {
            $this.eventStore['onTaskChange'] = buttonData;
            return;
        }

        $this.currentTaskId = buttonData.taskId;
        $this.pickButton = buttonData;
        $this.renderSidebarPickButton();
    };

    this.onTimerStarted = function(event, eventData)
    {
        var taskId = eventData['taskId'];
        var taskName = eventData['taskName'];

        $this.startButton.taskId = taskId;
        $this.startButton.taskName = taskName;
        $this.isRunning = true;
        $this.currentTaskId = taskId;

        pushRecentTask(taskId, taskName);

        $this.renderSidebarStartButton();
    };

    this.onTimerStopped = function (event, eventData)
    {
        if ($this.eventStore['onTaskChange'])
        {
            $this.startButton = $this.eventStore['onTaskChange'];
            $this.eventStore['onTaskChange'] = null;
        }
        else
        {
            var taskId = eventData['taskId'];
            var taskName = eventData['taskName'];

            $this.startButton.taskId = taskId;
            $this.startButton.taskName = taskName;
        }
        $this.isRunning = false;

        $this.renderSidebarStartButton();
        if ($this.eventStore['onEntriesLoaded'])
        {
            $this.onEntriesLoaded(null, $this.eventStore['onEntriesLoaded']);
            $this.eventStore['onEntriesLoaded'] = null;
        }
    };

    this.onSidebarClick = function(e)
    {
        var target = $(e.target);
        var button;

        button = $("#tc-sidebar-start-button");
        if (target.is(button) || button.length && $.contains(button[0], target[0]))
            return;

        button = $("#tc-sidebar-pick-button");
        if (target.is(button) || button.length && $.contains(button[0], target[0]))
            return;

        $this.expand();
    };
    this.expand = function()
    {
        if (!$this.isCollapsed)
            return;

        $this.sidebar.removeClass('collapsed').addClass('expanded');
        $this.isCollapsed = false;
    };

    this.collapse = function(e)
    {
        if (e)
        {
            var target = $(e.target);
            var button;

            button = $(".tc-sidebar");
            if (target.is(button) || button.length && $.contains(button[0], target[0]))
                return;
        }
        if ($this.isCollapsed)
            return;

        $this.sidebar.scrollTop(0).removeClass('expanded').addClass('collapsed');
        $this.sidebar.find('.tc-subtask-picker').hide();
        $this.isCollapsed = true;
    };

    this.loadTemplates = function() {
        $.each($this.templates, function (name, url) {
            $.get(chrome.extension.getURL("templates/sidebar/"+url+".html"), function (data) {
                ich.addTemplate(name,data);
            });
        });
    };

    this.toggleEnabled = function()
    {
        chrome.storage.sync.set({"isSidebarEnabled": !$this.isSidebarEnabled});
    };

    chrome.storage.sync.get({"isSidebarEnabled": true}, function (items)
    {
        $this.isSidebarEnabled = items["isSidebarEnabled"];
    });

    this.loadTemplates();
    setInterval($this.watch, 100);
    this.bindEvents();

    Chart.defaults.global.animation = false;
    Chart.defaults.global.maintainAspectRatio = true;
}