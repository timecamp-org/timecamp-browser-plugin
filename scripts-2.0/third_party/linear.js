'use strict';

const LINEAR = 'linear';

tcbutton.render(
    'div[data-view-id="issue-view"]:not(.tc)',
    { observe: true },
    function ($container) {
        if ($container.querySelector('.tc-button')) {
            return;
        }

        const title = $container.querySelector('[aria-label="Issue title"]')?.textContent;
        const projectElem = $container.parentElement.parentElement.querySelector(
            'svg[aria-label="Project"]'
        );
        const project = projectElem?.nextElementSibling?.textContent?.trim();

        const link = tcbutton.createTimerLink({
            className: LINEAR,
            description: title || 'Linear Issue',
            projectName: project,
            buttonType: 'text_with_pin'
        });

        const sidebar = $container.parentElement.parentElement.lastElementChild.firstElementChild;
        if (sidebar && sidebar.lastElementChild) {
            // sidebar.lastElementChild.appendChild(link);
            sidebar.lastElementChild.insertAdjacentElement('afterbegin', link);
        }

        return true;
    }
);
