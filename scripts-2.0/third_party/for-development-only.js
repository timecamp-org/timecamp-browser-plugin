'use strict';

tcbutton.render('.tcdev-button:not(.tc)', {}, function (elem) {
    const taskName = $('.button-placeholder #name').textContent;
    const projectName = $('.button-placeholder #desc').textContent;

    const link = tcbutton.createTimerLink({
        className: 'bitbucket',
        description: taskName,
        projectName: projectName
    });

    $('.button-placeholder').appendChild(link);
});

tcbutton.render('.tcdev-button2:not(.tc)', {}, function (elem) {
    const taskName = $('.button-placeholder2 #name2').textContent;
    const projectName = $('.button-placeholder2 #desc2').textContent;

    const link = tcbutton.createTimerLink({
        className: 'bitbucket',
        description: taskName,
        projectName: projectName
    });

    $('.button-placeholder2').appendChild(link);
});
