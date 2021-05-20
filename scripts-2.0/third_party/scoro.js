'use strict';

const SERVICE = 'scoro';

if ((window.location.href.indexOf("main") !== -1) || (window.location.href.indexOf("tasks") !== -1)) {
    tcbutton.render('.Tasktd:not(.tc)', {observe: true}, (elem) => {
        let titleElem = $('.eventName', elem);
        let title = $('.bold', titleElem);
        
        const link = tcbutton.createTimerLink({
            className: SERVICE,
            description: title.textContent,
            buttonType: 'minimal',
        });
        
        elem.parentNode.appendChild(link);

        link.style.paddingTop = 0;

        if (window.location.href.indexOf("tasks") !== -1) {
            $(".tasksContainer").style.paddingLeft = "8px";
            link.style.paddingLeft = "10px";
        }
    });
}

if (window.location.href.indexOf("tasks/view") !== -1) {
    tcbutton.render('.buttonbar.compact-button-bar:not(.tc)', {observe: true}, (elem) => {
        let title = $('.ellip');

        const link = tcbutton.createTimerLink({
            className: SERVICE,
            description: title.textContent,
        });
        
        link.style.position = "absolute";
        link.style.top = "-15px";
        link.style.left = "-35px";

        $('.buttonbar.compact-button-bar').parentNode.appendChild(link);
    });
}