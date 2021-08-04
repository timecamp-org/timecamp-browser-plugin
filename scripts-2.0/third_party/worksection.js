'use strict';

function getProjectName () {
    const printHeaderElem = document.querySelector('#header_print');

    return printHeaderElem && printHeaderElem.lastChild && printHeaderElem.lastChild.nodeValue
        ? printHeaderElem.lastChild.nodeValue.trim()
        : '';
}

tcbutton.render('.task:not(.tc)', { observe: true }, function (elem) {
    function getDescription () {
        // Task details view
        const descriptionElem = elem.querySelector('h1 > a');
        if (descriptionElem) return descriptionElem.textContent.trim();

        // Task modal view
        const descriptionModalElem = document.querySelector('#TB_title .name a');
        return descriptionModalElem ? descriptionModalElem.textContent.trim() : '';
    }

    const link = tcbutton.createTimerLink({
        className: 'worksection',
        description: getDescription,
        projectName: getProjectName
    });

    const root = document.querySelector('.buts_menu');
    if (!root) {
        return false;
    }

    root.appendChild(link);

    return true;
});

tcbutton.render('#tasks_images .item:not(.tc)', { observe: true }, function (elem) {
    function getDescription () {
        const descriptionElem = elem.querySelector('.name > a');
        return descriptionElem ? descriptionElem.textContent.trim() : '';
    }

    const link = tcbutton.createTimerLink({
        buttonType: 'minimal',
        className: 'worksection',
        description: getDescription,
        projectName: getProjectName
    });

    const root = elem.querySelector('.td_actions > span');
    if (!root) {
        return false;
    }

    root.appendChild(link);

    return true;
});
