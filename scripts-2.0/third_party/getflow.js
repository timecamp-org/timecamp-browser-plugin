'use strict';

tcbutton.render(
    '.task-list-section-collection-list li:not(.tc)',
    { observe: true },
    function (elem) {
        const container = $('.content-list-item-label', elem);
        const description = $('.content-list-item-name-wrapper', container).textContent;

        const link = tcbutton.createTimerLink({
            className: 'getflow',
            description: description,
            projectName: $('.task-list-section-header-link').textContent.trim()
        });

        container.appendChild(link);
    }
);

tcbutton.render(
    '#app-pane .task-pane-name-field-textarea:not(.tc)',
    { observe: true },
    function (elem) {
        const container = $('#app-pane .task-details-list');

        const descFunc = function () {
            return elem.value;
        };

        const projectFunc = function () {
            return $('#app-pane .task-pane-details-list-link').textContent.trim();
        };

        const link = tcbutton.createTimerLink({
            className: 'getflow',
            description: descFunc,
            projectName: projectFunc
        });

        container.appendChild(link);
    }
);
