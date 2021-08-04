'use strict';

tcbutton.render(
    '#filter-navigator-container:not(.tc)',
    { observe: true },
    function () {
        const numElem = $('.item-title');
        const titleElem = $('.item-title');
        const projectElem = $('.project-info a');

        let description = titleElem.textContent;
        if (numElem !== null) {
            description = numElem.textContent + ' ' + description;
        }

        const link = tcbutton.createTimerLink({
            className: 'gemini',
            description: description,
            projectName: projectElem.textContent
        });

        $('#filter-navigator-container').parentNode.insertBefore(
            link,
            $('#filter-navigator-container')
        );

        return true;
    }
);
