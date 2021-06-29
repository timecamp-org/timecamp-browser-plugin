'use strict';

const GOOGLE_CALENDAR = 'googlecalendar';

//Table view
tcbutton.render(
    '.i5a7ie:not(.tc)',
    {observe: true},
    elem => {
        if ($('.tc-button', elem)) {
            return false;
        }

        const description = () => {
            return $('.JAPzS', elem.parentElement.parentElement).dataset.text;
        };

        const link = tcbutton.createTimerLink({
            className: GOOGLE_CALENDAR,
            additionalClasses: [GOOGLE_CALENDAR + '__entry'],
            description: description,
            isBackendIntegration: true
        });

        $('.pPTZAe', elem).prepend( link);

        return true;
    }
);
