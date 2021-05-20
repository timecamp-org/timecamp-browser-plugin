'use strict';

const SERVICE = 'hubspot';

tcbutton.render('[data-test-id="sticky-subject-header"]:not(.tc)', { observe: true }, elem => {
    setTimeout(function(){
        const subject = document.querySelector('[data-test-id="sticky-subject-header"]').textContent;
        const contact = document.querySelector('[data-test-id="known-contact-info-highlight"]').textContent;
        const ticketId = window.location.href.split('/')[6].replace("#reply-editor", "");
        const description = "[#" + ticketId + "] " + subject + " [" + contact + "]";

        const link = tcbutton.createTimerLink({
            className: SERVICE,
            description: description,
        });
        
        link.style.position = 'absolute';
        link.style.right = '10px';
        link.style.top = '65px';

        elem.appendChild(link);
    }, 500);
});

tcbutton.render('[data-selenium-test="highlightTitle"]:not(.tc)', { observe: true }, elem => {
    setTimeout(function(){
        const container = elem.parentElement;
        const ticketId = window.location.href.split('/')[6].replace("/", "");
        let description = '';
        
        if (document.querySelector(".width-100 a.private-link.uiLinkWithoutUnderline.uiLinkDark")) {
            let contact = document.querySelector(".width-100 a.private-link.uiLinkWithoutUnderline.uiLinkDark").textContent;
            description = "[#" + ticketId + "] " + elem.textContent + " (" + contact + ")";
        } else {
            description = "[#" + ticketId + "] " + elem.textContent;
        }

        const link = tcbutton.createTimerLink({
            className: SERVICE,
            description: description,
        });
        
        link.style.display = 'block';

        container.appendChild(link);
    }, 500);
});
