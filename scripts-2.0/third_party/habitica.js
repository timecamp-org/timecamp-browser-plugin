'use strict';

tcbutton.render(
    '.daily .tasks-list .task:not(.tc), .habit .tasks-list .task:not(.tc), .todo .tasks-list .task:not(.tc)',
    { observe: true },
    function (elem) {
        const text = $('.task-title', elem).textContent.trim();
        const container = $('.icons-right', elem);

        const link = tcbutton.createTimerLink({
            className: 'habitica',
            description: text,
            buttonType: 'minimal'
        });

        container.prepend(link);
    }
);
