'use strict';

tcbutton.render(
    '#viewTask-infoSummary:not(.tc)',
    { observe: true },
    function (elem) {
        const projectNr = elem.querySelector('dd').textContent;
        const project = $('#viewTask-projectName', elem).textContent;
        const title = $('h2', elem).textContent;
        const description = projectNr + ' - ' + project + ' : ' + title;

        const link = tcbutton.createTimerLink({
            className: 'proworkflow',
            description: description,
            projectName: projectNr + ' - ' + project
        });

        elem.appendChild(link);
    }
);
