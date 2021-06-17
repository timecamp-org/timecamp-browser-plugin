'use strict';

const SERVICE = 'usepixie';

(function(){

    function ready(callbackFunc) {
        if (document.readyState !== 'loading') {
            callbackFunc();
        } else {
            document.addEventListener('DOMContentLoaded', callbackFunc);
        }
    }

    ready(() => {
        tcbutton.renderTo('#job-details-header .c-toolbar-container:not(.tc)', (elem) => {
            let container = $('.c-header > .c-header__section:nth-child(3)');
            let plusBtn = $('.c-dropdown-container:nth-child(1)');
            let taskName = $('.c-header__jobtitle').textContent.trim();
            let clientName = $('.c-header--context__section--client').dataset.clientName;

            const link = tcbutton.createTimerLink({
                className: SERVICE,
                description: `${clientName} - ${taskName}`,
                projectName: clientName,
            });

            link.classList.add('c-button','c-button--outline','c-button--neutral','u-mr-small');
            link.dataset.flitem = "shy-left--";
            plusBtn.dataset.flitem = "";
            container.insertBefore(link, plusBtn);

            return true;
        });
    });

    ready(() => {
        if (!location.pathname.startsWith('/clients/')) return;

        tcbutton.renderTo('.c-toolbar-container:not(.tc)', (elem) => {
            let container = $('.c-header > .c-header__section:nth-child(3)');
            let plusBtn = $('.c-dropdown-container:nth-child(1)');
            let clientName = $('.c-header .o-media .o-media__body .c-heading-3').textContent.trim();

            const link = tcbutton.createTimerLink({
                className: SERVICE,
                description: clientName,
            });
            
            link.classList.add('c-button','c-button--outline','c-button--neutral','u-mr-small');
            link.dataset.flitem = "shy-left--";
            plusBtn.dataset.flitem = "";
            container.insertBefore(link, plusBtn);

            return true;
        });
    });

})();
