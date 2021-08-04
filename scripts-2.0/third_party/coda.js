'use strict';

tcbutton.render('[data-coda-ui-id="canvas"]:not(.tc)', {observe: true}, function (elem) {
    let description = document.title;
    const link = tcbutton.createTimerLink({
        className: 'coda',
        description: description,
    });
    
    link.style.display = "block";
    link.style.paddingTop = "0";
    link.style.paddingBottom = "0";
    link.style.cursor = 'pointer';
    link.style.position = "absolute";
    link.style.top = '15px';
    link.style.left = "15px";
    elem.appendChild(link);

    return true;
});