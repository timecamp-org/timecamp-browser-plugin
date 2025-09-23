'use strict';

const SERVICE = 'pipedrive';

tcbutton.render('[data-testid="header-title"]:not(.tc)', {observe: true}, function (elem) {
    const description = function () {
        const textArea = $('textarea', elem);
        if (textArea) {
            const value = (textArea.value || textArea.innerText || '').trim();
            if (value) {
                return value;
            }
        }

        const nameElement = $(
            '[data-test="editable-input-content"], [data-testid="editable-input-content"], h1, [data-test="deal-title"], [data-testid="header-title"]',
            elem
        ) || elem;

        let text = (nameElement.textContent || '').trim();
        text = text.replace(/\s*Start timer\s*$/i, '').trim();
        return text;
    };

    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description: description,
    });

    elem.style.display = "flex";
    elem.style.alignItems = "center";
    elem.style.justifyContent = "space-between";

    link.style.display = "block";
    link.style.paddingTop = "0";
    link.style.paddingBottom = "0";
    link.style.marginLeft = "10px";
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