'use strict';

tcbutton.render(
    '#main > #content.ticket:not(.tc)',
    { observe: true },
    function (elem) {
        const tracTicketId = (
            $('#main > #content.ticket > #ticket > h2 > .trac-id') ||
            $('#main > #content.ticket > h1#trac-ticket-title > a')
        ).textContent;

        const tracTicketDescription = $(
            '#main > #content.ticket > #ticket .summary',
            elem
        ).textContent;

        const tracProjectName =
            $('title')
                .textContent.split('     – ')
                .pop() || $('#banner > #header > #logo > img').attr('alt');

        const container =
            $('#main > #content.ticket > #ticket > h2 > .trac-type', elem) ||
            $('#main > #content.ticket > h1#trac-ticket-title > a', elem);

        const link = tcbutton.createTimerLink({
            className: 'trac',
            description: tracTicketId + ' ' + tracTicketDescription,
            projectName: tracProjectName
        });

        const spanTag = document.createElement('span');
        container.parentNode.appendChild(spanTag.appendChild(link));
    }
);
