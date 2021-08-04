'use strict';

tcbutton.render(
    '.pagetitle-menu.pagetitle-container:not(.tc)',
    { observe: true },
    elem => {
        const link = tcbutton.createTimerLink({
            className: 'bitrix24',
            description: $('#pagetitle').textContent.trim(),
        });

        elem.prepend(link);

        return true;
    }
);

tcbutton.render(
    '.main-grid-row .task-timer:not(.tc)',
    { observe: true },
    elem => {
        const link = tcbutton.createTimerLink({
            className: 'bitrix24',
            buttonType: 'minimal',
            description: elem.parentElement.textContent.trim(),
        });

        elem.appendChild(link);

        return true;
    }
);
