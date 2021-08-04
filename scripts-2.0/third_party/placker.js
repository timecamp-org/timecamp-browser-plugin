'use strict';

tcbutton.render(
    '.plackerModal:not(.tc)',
    { observe: true },
    (elem) => {
        const interval = setInterval(function () {
            const actionButton = $('.dialogCardHeaderOverviewComponent__bottomRight');

            if (!actionButton) {
                return false;
            }

            clearInterval(interval);

            const getProject = () => {
                const project = $('.breadcrumbComponent .breadcrumbComponent__item:first-child .breadcrumbComponent__itemLink', elem);
                return project ? project.textContent.trim() : '';
            };

            const getDescription = () => {
                const description = $('.dialogCardHeaderOverviewComponent__titleInput', elem);
                return description ? description.textContent.trim() : '';
            };

            const container = createTag('div', 'button-link placker-tb-wrapper');
            const link = tcbutton.createTimerLink({
                className: 'placker',
                description: getDescription,
                projectName: getProject,
                container: '.plackerModal'
            });

            container.addEventListener('click', (e) => {
                e.preventDefault();
                link.click();
            });

            container.appendChild(link);
            actionButton.prepend(container);
        }, 100);

        return true;
    },
    '.plackerModal'
);
