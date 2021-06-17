'use strict';

const SERVICE = 'wekan';

tcbutton.render('.checklist-item:not(.tc)', {observe: true}, (elem) => {
    let description = $('.item-title > .viewer > p', elem)
    
    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description: description.textContent,
    });
    
    link.style.position = "right";
    link.style.left = "15px";
    link.style.fontSize = "16px";
    elem.appendChild(link);

    return true;
});