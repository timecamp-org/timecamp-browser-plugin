'use strict';

const SERVICE = 'pipedrive';

tcbutton.render('.actionsContent:not(.tc)', {observe: true}, function (elem) {
    let description = $('.descriptionHead h1 a', elem).textContent;
    
    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description: description,
    });
    
    link.style.display = "block";
    link.style.paddingTop = "0";
    link.style.paddingBottom = "0";
    link.style.marginBottom = "10px";
    link.style.marginTop = "10px";
    link.style.cursor = 'pointer';
    elem.appendChild(link);
});

tcbutton.render('.cui4-modal__wrap .cui4-modal__header:not(.tc)', {observe: true}, function (elem) {
    setTimeout(function(){
        let description = $('.cui4-input__box [data-test="activity-subject"]').value;

        const link = tcbutton.createTimerLink({
            className: SERVICE,
            description: description,
        });        
        
        link.style.position = "absolute";
        link.style.paddingTop = "0";
        link.style.paddingBottom = "0";
        link.style.marginBottom = "10px";
        link.style.marginTop = "10px";
        link.style.cursor = 'pointer';
        link.style.right = "40px";
        link.style.top = '2px';
        elem.appendChild(link);
    }, 500);
});

tcbutton.render('.detailView .content .spacer:not(.tc)', {observe: true}, function (elem) {
    let description = document.title.replace('- contact details','');

    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description: description,
    });
    
    link.style.display = "block";
    link.style.paddingTop = "0";
    link.style.paddingBottom = "0";
    link.style.marginBottom = "10px";
    link.style.marginTop = "10px";
    link.style.cursor = 'pointer';
    elem.appendChild(link);
});