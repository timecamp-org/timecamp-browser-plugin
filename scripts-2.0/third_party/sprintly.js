'use strict';

tcbutton.render(
    '.modal-content .card_container:not(.tc)',
    { observe: true },
    function (elem) {
        const description = $('.card_container .body a.title', elem).textContent.trim();
        const link = tcbutton.createTimerLink({
            className: 'sprintly',
            description: description
        });

        $('.card_container .card .top', elem).appendChild(link);

        return true;
    }
);
