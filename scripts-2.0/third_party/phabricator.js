'use strict';

tcbutton.render(
    '#phabricator-standard-page-body .phui-workpanel-view .phui-oi:not(.tc)',
    { observe: true },
    function (elem) {
        const description = $('.phui-oi-name', elem).textContent.trim();
        const projectName = $(
            '.phui-crumb-view[href^="/project/profile"]:not(.phabricator-last-crumb), .phui-header-view > a'
        ).textContent.trim();

        const link = tcbutton.createTimerLink({
            className: 'phabricator',
            buttonType: 'minimal',
            description: description,
            projectName: projectName
        });

        $('.phui-oi-name', elem).appendChild(link);
    }
);

tcbutton.render(
    '#phabricator-standard-page-body:not(.tc)',
    { observe: true },
    function (elem) {
        const wrap = document.createElement('li', 'phabricator-action-view');
        const container = $('.phabricator-action-list-view', elem);
        const desc = elem.querySelector(
            '.phui-two-column-header .phui-header-view .phui-header-header'
        );
        let number = $('.phabricator-last-crumb .phui-crumb-name') || '';
        let projectName = $('.phabricator-handle-tag-list-item > a');

        if (number) {
            number = number.textContent.trim() + ' ';
        }

        projectName = projectName ? projectName.textContent.trim() : '';

        const link = tcbutton.createTimerLink({
            className: 'phabricator',
            description: number + desc.textContent,
            projectName: projectName
        });

        wrap.appendChild(link);
        container.prepend(wrap);
    }
);
