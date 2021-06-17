'use strict';

tcbutton.render(
    '.document-name-container:not(.tc)',
    { observe: true, debounceInterval: 2000 },
    function (elem) {
        const description = $('.navbar-document-version', elem).textContent.trim();
        const project = $('.navbar-document-name', elem).textContent.trim();

        const link = tcbutton.createTimerLink({
            className: 'onshape',
            description: project + ' - ' + description,
            buttonType: 'minimal'
        });

        $('.navbar-document-and-workspace-names').appendChild(link);

        return true;
    }
);
