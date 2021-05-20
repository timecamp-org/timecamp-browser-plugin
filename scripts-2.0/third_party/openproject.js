'use strict';

tcbutton.render(
    '.work-packages--show-view:not(.tc)',
    { observe: true },
    function (elem) {
        const workPackageId = $('.work-packages--info-row > span:first-of-type').textContent.trim();
        const container = $('.toolbar-items', elem);
        const description = '[OP' + workPackageId + '] ' + $('.subject').textContent.trim();
        const projectName = $('#projects-menu').title.trim();

        const link = tcbutton.createTimerLink({
            className: 'openproject',
            description: description,
            projectName: projectName
        });

        container.prepend(link);
    }
);