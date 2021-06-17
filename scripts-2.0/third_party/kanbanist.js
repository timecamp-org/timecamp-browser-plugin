'use strict';

const stylesheet = document.styleSheets.item(document.styleSheets.length - 1);
stylesheet.insertRule('.tc-button.active {visibility:visible !important}');

tcbutton.render(
    '.ListItem:not(.tc)',
    { observe: true },
    $container => {
        const descriptionSelector = () => {
            const $description = $('.ListItem-text', $container);
            return $description.textContent.trim();
        };

        const projectSelector = () => {
            const $project = $('.ListItem-project-name', $container);
            return $project.textContent.trim();
        };

        const linkStyle = 'margin-left: 5px;visibility: hidden';
        const link = tcbutton.createTimerLink({
            className: 'kanbanist',
            description: descriptionSelector,
            projectName: projectSelector,
            buttonType: 'minimal'
        });
        link.classList.add('task-link');
        link.setAttribute('style', linkStyle);
        $('.ListItem-text', $container).after(link);
        $container.onmouseenter = () => {
            link.style.visibility = 'visible';
        };
        $container.onmouseleave = () => {
            link.style.visibility = 'hidden';
        };

        return true;
    }
);
