'use strict';

tcbutton.render(
    '#ticket_tabs_container #ticket_thread:not(.tc)',
    { observe: true },
    function (elem) {
        const titleElem = $('.flush-left a');
        const projectElem = $('.tixTitle');
        const ticketNameText = titleElem.textContent.trim();
        const projectNameText = projectElem.textContent.trim();

        const description = ticketNameText + ' [' + projectNameText + ']';
        const link = tcbutton.createTimerLink({
            className: 'osTicket',
            description: description,
            projectName: projectNameText
        });

        $('.flush-left h2').append(link);
    }
);

tcbutton.render(
    '#task_thread_container #task_thread_content:not(.tc)',
    {
        observe: true
    },
    function (elem) {
        const titleElem = $('.flush-left a');
        const projectElem = $('.tixTitle');
        const ticketNameText = titleElem.textContent.trim();
        const projectNameText = projectElem.textContent.trim();

        const description = ticketNameText + ' [' + projectNameText + ']';
        const link = tcbutton.createTimerLink({
            className: 'osTicket',
            description: description,
            projectName: projectNameText
        });

        $('.flush-left h2').append(link);
    }
);
