'use strict';

tcbutton.render(
    '[data-toggl="taskRow"]:not(.tc)',
    { observe: true },
    $container => {
        const $description = $('[data-toggl="taskRow-name"]', $container);

        const link = togglbutton.createTimerLink({
            className: 'brokerengine',
            description: () => $description.getAttribute('title').trim(),
            buttonType: 'minimal'
        });

        $description.after(link);

        return true;
    }
);

tcbutton.render(
    '[data-toggl="loanApp"]:not(.tc)',
    { observe: true },
    $container => {
        const $header = $('[data-toggl="loanHeader"]', $container);

        const link = togglbutton.createTimerLink({
            className: 'brokerengine',
            description: () => $('h1', $header).getAttribute('title').trim()
        });

        $header.append(link);

        return true;
    }
);

tcbutton.render(
    '[data-toggl="loanDrawer"]:not(.tc)',
    { observe: true },
    $container => {
        const $header = $('[data-toggl="loanHeader"]', $container);

        const link = togglbutton.createTimerLink({
            className: 'brokerengine',
            description: () => $('h1', $header).getAttribute('title').trim()
        });

        $('[data-toggl="loanDrawer-headerCol"]').append(link);

        return true;
    }
);
