'use strict';

tcbutton.render('#navbar:not(.tc)', { observe: true }, function (elem) {
    const description = $('.navbar-tree-name', elem);
    const project = '';

    const descFunc = function () {
        return description.textContent.trim();
    };

    const link = tcbutton.createTimerLink({
        className: 'gingko',
        description: descFunc,
        projectName: project,
        buttonType: 'minimal'
    });

    link.style.margin = '9px';

    $('.right-block').appendChild(link);

    return true;
});
