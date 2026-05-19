'use strict';
tcbutton.render(
    '.navigation-toolbar-wrapper__content .navigation-toolbar:not(.tc)',
    { observe: true, debounceInterval: 500 },
    elem => {
        const link = tcbutton.createTimerLink({
            className: 'wrike',
            description: elem.textContent?.trim(),
        });

        elem.parentNode.insertAdjacentElement('beforebegin', link);

        return true;
    }
);