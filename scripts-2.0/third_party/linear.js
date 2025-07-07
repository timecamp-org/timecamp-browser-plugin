'use strict';

const LINEAR = 'linear';

tcbutton.render(
    'div[data-view-id="issue-view"]:not(.tc)',
    { observe: true },
    function (elem) {
        if (elem.querySelector('.tc-button')) {
            return;
        }

        const title = elem.querySelector('[aria-label="Issue title"]')?.textContent;
        const projectElem = elem.parentElement.parentElement.querySelector(
            'svg[aria-label="Project"]'
        );
        const project = projectElem?.nextElementSibling?.textContent?.trim();

        const link = tcbutton.createTimerLink({
            className: LINEAR,
            description: title || 'Linear Issue',
            projectName: project,
            buttonType: 'text_with_pin'
        });

        const sidebar = elem.parentElement.parentElement.lastElementChild.firstElementChild;
        if (sidebar && sidebar.lastElementChild) {
            sidebar.lastElementChild.insertAdjacentElement('afterbegin', link);
        }

        return true;
    }
);
