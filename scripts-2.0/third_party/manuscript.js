'use strict';

const SERVICE = 'manuscript';

tcbutton.render('.case:not(.tc)', {observe: true}, (elem) => {
    let description = $('h1', elem).textContent;
    let tcDiv = createTag('div', 'tc-container');
    let appendTo = $('.controls');

    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description: description,
    });
    
    link.style.position = "relative";
    link.style.top = "0px";
    link.style.left = "15px";
    tcDiv.appendChild(link);
    appendTo.parentNode.insertBefore(tcDiv, appendTo);

    return true;
});