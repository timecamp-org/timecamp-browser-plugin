'use strict';

tcbutton.render(
    '.inline-asset-detail .asset-summary:not(.tc)',
    { observe: true },
    function (elem) {
        const description = $(
            '.main-panel .asset-heading #asset-title-mount .title',
            elem
        ).textContent;

        const project = $(
            '.main-panel .main-panel-scroller .fields .text .asset-name-link span',
            elem
        ).textContent;

        const container = $('.toolbar .utility', elem);

        const link = tcbutton.createTimerLink({
            className: 'versionone',
            description: description,
            projectName: project,
            buttonType: 'minimal'
        });
        link.setAttribute('style', 'margin-right: 10px');
        container.insertBefore(link, $('.share', container));
    }
);
