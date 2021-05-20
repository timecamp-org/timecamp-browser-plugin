'use strict';

tcbutton.render(
    '.pd-incidents-table .details-cell:not(.tc)',
    { observe: true },
    elem => {
        const link = tcbutton.createTimerLink({
            className: 'pagerduty',
            buttonType: 'minimal',
            description: $('.ember-view', elem).textContent.trim(),
            projectName: ''
        });

        elem.prepend(link);
    }
);
