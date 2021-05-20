'use strict';

tcbutton.render('#content .right:not(.tc)', { observe: true }, function (
    elem
) {
    const description = $('h2.Thread__subject').textContent.trim();
    const project = $('.site-header__title').textContent.trim();
    const existingTag = $('.sidebar__module.tc');

    if (existingTag) {
        if (existingTag.parentNode.firstChild.classList.contains('tc')) {
            return;
        }
        existingTag.parentNode.removeChild(existingTag);
    }

    const div = document.createElement('div');
    div.classList.add('sidebar__module', 'tc');

    const link = tcbutton.createTimerLink({
        className: 'codebase',
        description: description,
        projectName: project
    });

    div.appendChild(link);
    elem.prepend(div);
});

tcbutton.render(
    '.merge-request-summary:not(.tc)',
    { observe: true },
    function () {
        const description = $('h2.u-ellipsis').textContent.trim();
        const project = $('.site-header__title').textContent.trim();

        const link = tcbutton.createTimerLink({
            className: 'codebase',
            description: description,
            projectName: project
        });

        $('.merge-request-summary__title').appendChild(link);
    }
);
