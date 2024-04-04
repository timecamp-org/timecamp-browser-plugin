'use strict';

const SERVICE = 'pipedrive';

tcbutton.render('[data-testid="header-title"]:not(.tc)', {observe: true}, function (elem) {
    let description = $('textarea', elem).innerText;
    
    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description,
    });
    elem.style.display = "flex"
    link.style.display = "block";
    link.style.paddingTop = "0";
    link.style.paddingBottom = "0";
    link.style.marginBottom = "10px";
    link.style.marginTop = "10px";
    link.style.cursor = 'pointer';
    elem.appendChild(link);

    return true;
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

    return true;
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

    return true;
});