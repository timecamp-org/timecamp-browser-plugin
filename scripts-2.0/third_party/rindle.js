'use strict';

tcbutton.render(
    '.time__tracker .toggl__container:not(.tc)',
    { observe: true },
    function (elem) {
        const projectName = $('.navbar-default .dropdown .navbar-brand .ng-scope')
            .textContent;

        const descFunc = function () {
            const card = $('.toggl__card-title', elem);
            if (card) {
                return card.textContent;
            }
            return null;
        };

        const link = tcbutton.createTimerLink({
            className: 'rindle',
            description: descFunc,
            projectName: projectName
        });

        elem.appendChild(link);
    }
);
