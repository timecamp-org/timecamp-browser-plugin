'use strict';

tcbutton.render(
    'body.node-type-project-issue #tabs ul:not(.tc)',
    {},
    function (elem) {
        const link = tcbutton.createTimerLink({
            className: 'drupalorg',
            description: elem.textContent
        });

        elem.appendChild(document.createElement('li').appendChild(link));
    }
);
