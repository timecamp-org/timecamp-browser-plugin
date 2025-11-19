'use strict';
tcbutton.render(
    '.work-item-view__container .title:not(.tc)',
    {observe: true, debounceInterval: 500},
    elem => {
        const link = tcbutton.createTimerLink({
            className: 'wrike',
            description: elem.textContent?.trim(),
        });

        elem.parentNode.insertAdjacentElement('beforebegin', link);

        return true;
    }
);