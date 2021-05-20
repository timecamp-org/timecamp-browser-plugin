'use strict';

// Right side panel
tcbutton.render(
    '.js-main .tb-element-big:not(.tc)',
    { observe: true },
    function (elem) {
        const container = $('.tb-element-title', elem);
        const projectElem = $('.tb-element-subtitle a', elem);
        const titleElem = $('.js-element-title-inner a', container);

        const link = tcbutton.createTimerLink({
            className: 'redbooth',
            description: titleElem.textContent,
            projectName: projectElem && projectElem.textContent
        });

        container.appendChild(link);
    }
);

// Modal window
tcbutton.render(
    '.js-modal-dialog-content:not(.tc)',
    { observe: true },
    function (elem) {
        const container = $('.tb-element-title', elem);
        const projectElem = $('.tb-element-subtitle a', elem);
        const titleElem = $('.js-element-title-inner a', container);

        const link = tcbutton.createTimerLink({
            className: 'redbooth',
            description: titleElem.textContent,
            projectName: projectElem && projectElem.textContent
        });

        container.appendChild(link);
    }
);
