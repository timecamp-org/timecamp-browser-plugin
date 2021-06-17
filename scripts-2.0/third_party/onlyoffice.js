'use strict';

tcbutton.render(
    '.commonInfoTaskDescription:not(.tc)',
    { observe: true },
    function () {
        'use strict';
        let description = $('#essenceTitle');
        description = description ? description.textContent.trim() : null;

        let project = $('.task-desc-block .value a');
        project = project ? project.textContent.trim() : null;

        const link = tcbutton.createTimerLink({
            className: 'onlyoffice',
            description: description,
            projectName: project,
            buttonType: 'minimal'
        });
        $('.project-title').appendChild(link);

        return true;
    }
);

tcbutton.render(
    '.subtasks .subtask:not(.tc):not(.closed)',
    { observe: true },
    function (elem) {
        'use strict';
        let description = $('.taskName span', elem);
        description = description ? description.textContent.trim() : null;

        let project = $('.task-desc-block .value a');
        project = project ? project.textContent.trim() : null;

        const link = tcbutton.createTimerLink({
            className: 'onlyoffice',
            description: description,
            projectName: project,
            buttonType: 'minimal'
        });
        elem.insertBefore(link, $('.check', elem));
        const button = $('.tc-button.onlyoffice', elem);
        if (button && button.style) {
            button.style.float = 'left';
        }

        return true;
    }
);

tcbutton.render(
    '.taskList .task:not(.tc):not(.closed)',
    { observe: true },
    function (elem) {
        'use strict';
        let description = $('.taskName a', elem);
        description = description ? description.textContent.trim() : null;

        let project = $('#essenceTitle');
        project = project ? project.textContent.trim() : null;

        const link = tcbutton.createTimerLink({
            className: 'onlyoffice',
            description: description,
            projectName: project,
            buttonType: 'minimal'
        });
        elem.insertBefore(link, $('.check', elem));
        const button = $('.tc-button.onlyoffice', elem);
        if (button && button.style) {
            button.style.float = 'left';
        }

        return true;
    }
);
