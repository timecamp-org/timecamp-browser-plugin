'use strict';

tcbutton.render(
    '#item-title-control:not(.tc)',
    { observe: true },
    function () {
        const descriptionEl = $('.item-detail-page-header__item-title');
        const projectEl = $('#navbar-content > ul > li > a');
        const description = ((descriptionEl && descriptionEl.textContent) || '').trim();
        const projectName = ((projectEl && projectEl.textContent) || '').trim();
        const link = tcbutton.createTimerLink({
            className: 'rollbar',
            description,
            projectName
        });

        $('.item-status-level-area').appendChild(link);

        return true;
    }
);
