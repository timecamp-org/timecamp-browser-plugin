'use strict';

setTimeout(() => {
    tcbutton.render('.mw-indicators.mw-body-content:not(.tc)', {observe: true}, (elem) => {
        const root = $('div[id="content"]');
        const container = elem;
        const editText = $('h1[id="firstHeading"] .mw-editsection', root).textContent;
        const projectElem = $('h1[id="firstHeading"]', root).textContent.trim().replace(editText,'');
        const desc = $('h1[id="firstHeading"]', root).textContent.trim().replace(editText,'');
        const link = tcbutton.createTimerLink({
            className: 'wikipedia',
            description: desc,
            projectName: projectElem
        });
        container.appendChild(link);

        return true;
    });

}, 1000);