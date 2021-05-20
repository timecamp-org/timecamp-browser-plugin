'use strict';

const SERVICE = 'pipefy';

tcbutton.render('#edit-card-title:not(.tc)', {observe: true}, (elem) => {
    let description = $('#edit-card-title');
    
    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description: description.textContent,
    });
    
    link.style.position = "relative";
    link.style.left = "15px";
    link.style.fontSize = "16px";
    elem.parentNode.appendChild(link);
});