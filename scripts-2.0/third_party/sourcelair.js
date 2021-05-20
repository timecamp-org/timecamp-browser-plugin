'use strict';

tcbutton.render('#ide:not(.tc)', { observe: true }, function () {
    const projectFunc = function () {
        return $('.project-label .project-name').getAttribute('title');
    };

    const descFunc = function () {
        return $('.project-label .after.actionable').textContent;
    };

    const inlineCss = 'position: fixed; bottom: 1rem; right: 1rem; z-index: 9999;';
    const container = document.createElement('div');

    container.setAttribute('id', 'tc-sourceLair');
    container.setAttribute('style', inlineCss);

    const link = tcbutton.createTimerLink({
        className: 'sourcelair',
        projectName: projectFunc,
        description: descFunc
    });

    container.appendChild(link);
    $('.editor-panel').appendChild(container);
});
