'use strict';

const SERVICE = 'freedcamp';

tcbutton.render('.FastTaskItemComponent--fk-FastTaskItemComponent-MainContent:not(.tc)', {observe: true}, (elem) => {
    let project = $('.project_name').textContent.trim();
    let description = $('.FastTaskItemComponent--fk-FastTaskItemComponent-ItemTitle', elem).textContent.trim();
    
    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description: description,
        projectName: project,
        buttonType: 'minimal',
    });
    
    link.style.paddingTop = "0px";
    link.style.paddingRight = "10px";
    elem.parentNode.prepend(link);

    return true;
});

tcbutton.render('#mainItemWrap:not(.tc)', {observe: true}, (elem) => {
    let project = $('#project_name .project_name').textContent.trim();
    let description = $('.ItemView--fk-Item-Title').textContent.trim();
    
    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description: description,
        projectName: project,
    });
    
    link.style.paddingTop = "10px";
    link.style.paddingLeft = "20px";
    elem.parentNode.prepend(link);

    return true;
});

tcbutton.render('.al_container .item-title-group:not(.tc)', {observe: true}, (elem) => {
    let description = $('h3').textContent.trim();
    let project = $('h4.group-title a').textContent.trim();
    
    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description: description,
        projectName: project,
    });
    
    elem.parentNode.appendChild(link);

    return true;
});

tcbutton.render('.td_content:not(.tc)', {observe: true}, (elem) => {
    let project = $('.project_name').textContent.trim();
    let description = $('.td_description', elem).textContent.trim();
        
    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description: description,
        projectName: project,
        buttonType: 'minimal',
    });
    
    link.style.paddingTop = "0px";
    link.style.paddingTop = "10px";
    elem.parentNode.prepend(link);

    return true;
});

tcbutton.render('.body_width .item-title-group:not(.tc)', {observe: true}, (elem) => {
    let project = $('.project_name').textContent.trim();
    let description = $('h3').textContent.trim();
    
    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description: description,
        projectName: project,
    });
    
    elem.parentNode.appendChild(link);

    return true;
});

tcbutton.render('.issue_title:not(.tc)', {observe: true}, (elem) => {
    let project = $('.project_name').textContent.trim();
    let description = $('.issue_link', elem).textContent.trim();
    
    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description: description,
        projectName: project,
        buttonType: 'minimal',
    });
    
    elem.parentNode.appendChild(link);

    return true;
});