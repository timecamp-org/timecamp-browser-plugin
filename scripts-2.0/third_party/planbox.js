'use strict';

tcbutton.render(
    'div.importances:not(.tc)',
    { observe: true },
    function () {
        const description = $('#story_name p').textContent;
        const projectName = $('.project .name').textContent;
        const div = document.createElement('div');
        const importanceDiv = $('div.importances');
        const collectorDiv = importanceDiv.parentNode;

        div.className = 'fl';

        const link = tcbutton.createTimerLink({
            className: 'planbox',
            description: description,
            projectName: projectName
        });

        div.appendChild(link);
        collectorDiv.insertBefore(div, importanceDiv.nextSibling);
    }
);
