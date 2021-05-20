'use strict';

function addTimerLink (elem, description, location) {
    const text = $(description, elem).textContent;

    const link = tcbutton.createTimerLink({
        className: 'kanboard',
        description: text
    });

    $(location, elem).appendChild(link);
}

tcbutton.render(
    '.sidebar-content .page-header + .table-list .table-list-row:not(.tc)',
    { observe: true },
    function (elem) {
        addTimerLink(elem, '.table-list-title a', '.table-list-title');
    }
);

tcbutton.render(
    '.sidebar-content .page-header + .table-list .table-list-row .task-list-subtask:not(.tc)',
    { observe: true },
    function (elem) {
        addTimerLink(elem, '.subtask-title a', '.subtask-time-tracking');
    }
);

tcbutton.render(
    '.page > .table-list > .table-list-row:not(.tc)',
    { observe: true },
    function (elem) {
        addTimerLink(elem, '.table-list-title a', '.table-list-title');
    }
);

tcbutton.render('#task-summary:not(.tc)', { observe: true }, function (
    elem
) {
    if (!$('.buttons-header', elem)) {
        const div = document.createElement('div');
        div.className = 'buttons-header';
        $('.task-summary-container', elem).after(div);
    }
    addTimerLink(elem, 'h2', '.buttons-header');
});

tcbutton.render(
    '.subtasks-table tbody tr:not(.tc)',
    { observe: true },
    function (elem) {
        addTimerLink(elem, '.subtask-title a', '.subtask-time-tracking');
    }
);

tcbutton.render(
    '.ui-tooltip tbody tr + tr:not(.tc)',
    { observe: true },
    function (elem) {
        const span = document.createElement('span');
        span.setAttribute('style', 'padding-left: 10px');
        $('.subtask-title', elem).after(span);
        addTimerLink(elem, '.subtask-title a', '.subtask-title + span');
    }
);
