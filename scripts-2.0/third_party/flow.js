'use strict';

tcbutton.render('.task-details-main:not(.tc)', {observe: true}, function (elem) {
    let description = $('.task-pane-name-field-textarea', elem).textContent;
    let project = $('#app-pane > div.navigation-content-views.with-height-animation > div > div.task-pane-inner > div.task-details-wrap > div.task-pane-details-wrapper > div > div > div > div.task-details-main.tc > div.task-details-list > a:nth-child(2)').textContent;
    
    const link = tcbutton.createTimerLink({
        className: 'flow',
        description: description,
        projectName: project,
    });
    
    link.style.display = "block";
    link.style.cursor = 'pointer';
    elem.appendChild(link);

    return true;
});