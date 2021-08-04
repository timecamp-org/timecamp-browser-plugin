'use strict';

const SERVICE = 'nela';

tcbutton.render('.modal-content .card-body .card-title:not(.tc)', { observe: true }, (elem) => {
    if(document.getElementById('tcbutton')) {
        document.getElementById('tcbutton').remove();
    }

    const container = elem.querySelector('h6');
    const alias = container.innerText.trim();
    const task = elem.querySelector('div').innerText.trim();

    let project = document.querySelector('.kb-board .kb-header h4');
    if(project) {
        project = project.innerText.trim();
    } else {
        project = '';
    }

    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description: alias + ": " + task,
        projectName: project,
    });

    link.classList.add('position-relative', 'pl-3', 'ml-3');

    container.appendChild(link);

    return true;
});