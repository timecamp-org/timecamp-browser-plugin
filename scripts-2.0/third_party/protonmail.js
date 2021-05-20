'use strict';

tcbutton.render(
    '#conversationHeader:not(.tc)',
    { observe: true },
    function () {
        const spans = document
            .getElementsByTagName('h1')[0]
            .getElementsByTagName('span');
        const project = $('li.active');
        const container = $('#conversationHeader h1');
        const len = spans.length;
        let description;

        if (len > 1) {
            description = $('h1 span:nth-child(2)');
        } else {
            description = $('h1 span');
        }

        const link = tcbutton.createTimerLink({
            className: 'protonmail',
            description: description.textContent,
            projectName: project.textContent.trim()
        });

        container.appendChild(link);
    }
);
