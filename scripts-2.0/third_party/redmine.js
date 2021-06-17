'use strict';

tcbutton.render(
    'body.controller-issues.action-show #content h2:not(.tc)',
    {},
    function (elem) {
        const numElem = $('#content h2');
        const titleElem = $('.subject h3') || '';
        const projectElem = $('h1');
        let description;

        if ($('.tc-button')) {
            return false;
        }

        if (titleElem) {
            description = titleElem.textContent;
        }

        if (numElem !== null) {
            if (description) {
                description = ' ' + description;
            }
            description = numElem.textContent + description;
        }

        const link = tcbutton.createTimerLink({
            className: 'redmine',
            description: description,
            projectName: projectElem && projectElem.textContent
        });

        $('#content h2').appendChild(link);

        return true;
    }
);
