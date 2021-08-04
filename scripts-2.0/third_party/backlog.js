'use strict';

tcbutton.render('#issueArea:not(.tc)', { observe: true }, function (elem) {
    const container = createTag('span', '');
    const ticketNumElem = $('.ticket__key .ticket__key-number', elem);
    const titleElem = $('#summary .title-group__title-text', elem);
    const projectElem = $('.project-header .header-icon-set__name');
    const containerElem = $('#summary *:first-child');

    const descFunc = function () {
        return ticketNumElem.textContent + ' ' + titleElem.textContent;
    };

    const link = tcbutton.createTimerLink({
        className: 'Backlog',
        description: descFunc,
        projectName: projectElem.textContent,
        calculateTotal: true
    });

    container.appendChild(link);
    containerElem.parentNode.appendChild(container, containerElem);

    return true;
});
