'use strict';

const SERVICE = 'groupnwork';

tcbutton.render('#clockify-view:not(.tc)', {observe: true}, (elem) => {
    var container = $('#tc-container', elem);
    if (!container){
        return;
    }

    let description = $('#task-name');
    description = description ? description.value : '';
    
    let project = $('#board-title');
    project = project ? project.textContent : '';
    
    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description: description,
        projectName: project,
    });

    container.appendChild(link);
});