'use strict';

tcbutton.render(
    '[data-toggl-issue] [data-toggl-sidebar]:not(.tc)',
    { observe: true },
    elem => {
        const getAlias = function () {
            const aliasSelector = $('[data-tc-issue] [data-tc-alias]');
            if (!aliasSelector) return 'No Alias';
            return aliasSelector.getAttribute('data-tc-alias');
        };

        const getTitle = function () {
            const titleSelector = $('[data-tc-issue] [data-tc-title]');
            if (!titleSelector) return 'No Title';
            return titleSelector.getAttribute('data-tc-title') || 'No Title';
        };

        const getDescription = function () {
            return getAlias() + ' - ' + getTitle();
        };

        const getProjectName = function () {
            const projectSelector = $('[data-tc-issue] [data-tc-project]');
            if (!projectSelector) return null;
            return projectSelector.getAttribute('data-tc-project');
        };

        const link = tcbutton.createTimerLink({
            className: 'produck',
            description: getDescription,
            projectName: getProjectName
        });
        const li = document.createElement('li');
        li.classList.add('tc-item');
        li.appendChild(link);
        elem.prepend(li);
    }
);
