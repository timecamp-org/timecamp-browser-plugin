/**
 * Created by mdybizbanski on 02.11.15.
 */

function ChartService() {

    this.prepareDataset = function (chartType, entries)
    {
        if (!chartType || !entries)
            return null;

        var dataset = null;


        switch(chartType)
        {
            case 'bar' : dataset = prepareBarChartData(entries); break;
            case 'pie' : dataset = preparePieChartData(entries); break;
        }

        return dataset;
    };

    this.renderChart = function (targetSelector, type, dataset, options)
    {
        if (!targetSelector || !type || !dataset)
            return null;

        var chart = null;
        var ctx = $(targetSelector).get(0).getContext("2d");

        if (!options)
            options = {};

        switch (type)
        {
            case 'bar' : chart = new Chart(ctx).Bar(dataset, options); break;
            case 'pie' : chart = new Chart(ctx).Pie(dataset, options); break;
        }

        return chart;
    };

    function formatRange(unit, startOf, endOf) {
        var label = null;
        switch(unit) {
            case 'day' : label = startOf.format('ddd'); break;
            case 'isoweek' :
            case 'week' :
                if (startOf.month() != endOf.month())
                    label = startOf.format('DD MMM') + '/' + endOf.format('DD MMM');
                else
                    label = startOf.format('DD') + '/' + endOf.format('DD MMM');
                break;
            case 'month' : label = startOf.format('MMM'); break;
            case 'year' : label = startOf.format('YYYY'); break;
        }
        var range = moment.range(startOf,endOf);
        return {
            label: label,
            range: range,
            totalTime: 0
        };
    }

    function getColor(id)
    {
        id = id % 16 + 1;
        var colors = ["#8ec888", "#ffb980", "#69C466", "#74bbc2", "#54A18C", "#6BCFB6",
                      "#83C7C9", "#79C276", "#BF7972", "#D2907D", "#95A3D2", "#F1AB64",
                      "#CF828B", "#72BFA5", "#97B4D1", "#8C95CD"
        ];

        return colors[id];
    }

    function colorLuminance(hex, lum) {

        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;

        // convert to decimal and change luminosity
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00"+c).substr(c.length);
        }

        return rgb;
    }

    function preparePieChartData(entries) {
        var tasks = [];
        var maxVal = 0;

        for (i in entries)
        {
            var entry = entries[i];
            var taskId = entry.task_id;
            var idx = -1;

            for (j in tasks)
            {
                if (tasks[j].task_id == taskId)
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
                    task_id: taskId
                };
                if (maxVal < row.duration)
                    maxVal = row.duration;

                tasks.push(row);
            }
            else
            {
                tasks[idx].duration += parseInt(entry.duration, 10);
                if (maxVal < row.duration)
                    maxVal = row.duration;
            }
        }

        var dataset = [];
        var timeUnit = "s";
        var timeDivider = 1;

        if (maxVal > 7200)
        {
            timeDivider = 3600;
            timeUnit = 'h';
        }
        else if (maxVal > 60)
        {
            timeDivider = 60;
            timeUnit = 'min';
        }

        for (var i in tasks)
        {
            var subRange = tasks[i];
            var value = Math.floor(subRange.duration * 100 / timeDivider) / 100;
            var highlightColor = colorLuminance(getColor(i), 0.2);

            dataset.push({
                value: value,
                color: getColor(i),
                highlight: highlightColor,
                label: subRange.name
            });
        }

        Chart.defaults.global.tooltipTemplate   = "<%if (label){%><%=label%>: <%}%><%= value %>" + timeUnit;
        Chart.defaults.global.scaleLabel        = "<%= value %>" + timeUnit;

        return dataset;
    }

    function prepareBarChartData(entries) {
        var startDate = entries[0].date + " " + entries[0].start_time;
        var today = moment();

        var range = moment.range(startDate, today);
        var subRanges = [];

        var unit = "day";

        if (range.diff('days') <= 6)
            unit = 'day';
        else if (range.diff('week') <= 5)
            unit = 'week';
        else if (range.diff('months') <= 12)
            unit = 'month';
        else
            unit = 'year';

        range.by(unit+'s', function(m) {
            var unitTmp = unit;
            var startOf = moment(m).startOf(unitTmp);
            var endOf = moment(m).endOf(unitTmp);
            if (unit == 'week')
            {
                startOf.add(1, 'days');
                endOf.add(1, 'days');
            }
            var range = formatRange(unitTmp,startOf, endOf);
            subRanges.push(range);
        });

        if (!subRanges[subRanges.length-1].range.contains(today))
        {
            if (unit == 'week')
                unit = 'isoweek';
            subRanges.push(formatRange(unit,moment().startOf(unit), moment().endOf(unit)));
        }

        var maxTotalTime = 0;
        for(var i in entries)
        {
            var entry = entries[i];
            var datetime = entries[i].date + " " + entries[i].start_time;
            var m = moment(datetime, 'YYYY-MM-DD HH:mm:ss');

            for (var j in subRanges)
            {
                var subRange = subRanges[j];

                if (subRange.range.contains(m))
                {
                    subRange.totalTime += parseInt(entry.duration, 10);
                    if (subRange.totalTime > maxTotalTime)
                        maxTotalTime = subRange.totalTime;
                    break;
                }
            }
        }

        var labels = [];
        var datasetData = [];

        var timeUnit = "s";
        var timeDivider = 1;
        if (maxTotalTime > 7200)
        {
            timeDivider = 3600;
            timeUnit = 'h';
        }
        else if (maxTotalTime > 60)
        {
            timeDivider = 60;
            timeUnit = 'min';
        }

        for (var i in subRanges)
        {
            var subRange = subRanges[i];
            var value = Math.floor(subRange.totalTime * 100 / timeDivider)/100;
            datasetData.push(value);
            labels.push(subRange.label);
        }


        Chart.defaults.global.tooltipTemplate   = "<%if (label){%><%=label%>: <%}%><%= value %>" + timeUnit;
        Chart.defaults.global.scaleLabel        = "<%= value %>" + timeUnit;

        var seriesColor = getColor(3);

        return {
            labels: labels,
                datasets: [
                {
                    fillColor: seriesColor,
                    strokeColor: colorLuminance(seriesColor, -0.2),
                    highlightFill: colorLuminance(seriesColor, 0.2),
                    highlightStroke: seriesColor,
                    data: datasetData
                }
            ]
        };
    }
}