'use strict';

tcbutton.render(
    '.ticket-fields-panel:not(.tc)',
    { observe: true },
    function (elem) {
        const titleElem = $('h1.summary .number', elem);
        const numElem = $('h1.summary .text-field-text', elem);

        const projectName = $(
            '#account_header .nav:not(.right-actions-top) .dropdown-toggle'
        ).textContent;

        const description = titleElem.textContent + ': ' + numElem.textContent;

        const link = tcbutton.createTimerLink({
            className: 'unfuddle',
            description: description,
            projectName: projectName
        });

        $('.primary-properties', elem).appendChild(link);

        return true;
    }
);
