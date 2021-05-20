'use strict';

tcbutton.render('.toggl-target:not(.tc)', { observe: false }, function (
    elem
) {
    const description = elem.getAttribute('data-descr');
    const project = elem.getAttribute('data-proj');

    const link = tcbutton.createTimerLink({
        className: 'husky-marketing-planner',
        description: description,
        projectName: project,
        buttonType: 'minimal',
    });

    elem.appendChild(link);
});
