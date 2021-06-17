'use strict';

tcbutton.render(
    '.page-content .widget-toolbox .pull-left:not(.tc)',
    { observe: true },
    function (elem) {
        const description = document.querySelector('td.bug-summary').textContent;
        const project = document.querySelector('td.bug-project').textContent;

        const link = tcbutton.createTimerLink({
            className: 'mantishub',
            description: description,
            projectName: project
        });

        elem.appendChild(link);

        return true;
    }
);

tcbutton.render(
    '#view-issue-details:not(.tc)',
    { observe: true },
    function (elem) {
        const description = $('td.bug-summary', elem).textContent;
        const project = $('td.bug-project', elem).textContent;

        const link = tcbutton.createTimerLink({
            className: 'mantishub',
            description: description,
            projectName: project
        });

        $('.form-title', elem).appendChild(link);

        return true;
    }
);
