'use strict';

tcbutton.render('#widget99:not(.tc)', {observe: true}, function (elem) {
    const descriptionElement = document.getElementById('tc-task-name');
    const description = descriptionElement !== null
        ? descriptionElement.innerText
        : document.getElementsByClassName('cerb-subpage')[0].getElementsByTagName('h1')[0].innerText;

    const projectElement = document.getElementById('tc-project-name');
    const projectName = projectElement !== null ? projectElement.innerText : '';

    const link = tcbutton.createTimerLink({
        className: 'cerb',
        description: description,
        projectName: projectName
    });
    elem.appendChild(link);

    return true;
});
