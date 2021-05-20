'use strict';

tcbutton.render(
    '.single-tasks .right-side:not(.tc)',
    { observe: true },
    function (elem) {
        let description;
        const numElem = $('.task-id', elem);
        const titleElem = $('.entry-title', elem);
        const projectElem = $('.project a span.label', elem);
        const project = projectElem.textContent.trim();

        description = titleElem.textContent.trim();
        if (numElem !== null) {
            description = numElem.textContent + ' ' + description;
        }

        const link = tcbutton.createTimerLink({
            className: 'eproject',
            description: description,
            projectName: project
        });

        $('.tc-timer').appendChild(link);
    }
);

tcbutton.render(
    '.post-type-archive-tasks table.tasks-table tr:not(.tc)',
    { observe: true },
    function (elem) {
        let projectName;
        let description;
        const className = 'huh';
        const numElem = $('.task-id', elem);
        const container = $('.times', elem);
        const titleElem = $('.entry-title a span', elem);

        if (container === null) {
            return;
        }

        if ($('.entry-title a span', elem) === null) {
            return;
        }
        // This needs to be after the null check above
        description = titleElem.textContent.trim();

        projectName = '';
        if ($('.project-title a span.label')) {
            projectName = $('.project-title a span.label').textContent.trim();
        }

        if (numElem !== null) {
            description =
                'Task: #' + numElem.textContent.trim() + ' ' + description.trim();
            description = description.trim();
        }

        const link = tcbutton.createTimerLink({
            className: 'eproject',
            description: description,
            projectName: projectName,
            buttonType: 'minimal'
        });

        link.classList.add(className);

        link.addEventListener('click', function () {
            // Run through and hide all others
            let i;
            let len;
            const elems = document.querySelectorAll('.tc-button');
            for (i = 0, len = elems.length; i < len; i += 1) {
                elems[i].classList.add('huh');
            }

            if (link.classList.contains(className)) {
                link.classList.remove(className);
            } else {
                link.classList.add(className);
            }
        });

        const spanTag = document.createElement('span');
        spanTag.classList.add('tc-span');
        link.style.width = 'auto';
        link.style.paddingLeft = '25px';
        link.setAttribute('title', 'tc Timer');
        spanTag.appendChild(link);
        container.insertBefore(spanTag, container.lastChild);
    }
);

tcbutton.render(
    '.home .table-recent-tasks tr:not(.tc)',
    { observe: true },
    function (elem) {
        let projectName;
        let description;
        const className = 'huh';
        const numElem = $('.task-id', elem);
        const container = $('.actions', elem);
        const titleElem = $('.task-title', elem);

        if (container === null) {
            return;
        }

        if ($('.task-title', elem) === null) {
            return;
        }
        // This needs to be after the null check above
        description = titleElem.textContent.trim();

        projectName = '';
        if ($('.project a span.label')) {
            projectName = $('.project a span.label').textContent.trim();
        }

        if (numElem !== null) {
            description =
                'Task: #' + numElem.textContent.trim() + ' ' + description.trim();
            description = description.trim();
        }

        const link = tcbutton.createTimerLink({
            className: 'eproject',
            description: description,
            projectName: projectName,
            buttonType: 'minimal'
        });

        link.classList.add(className);

        link.addEventListener('click', function () {
            // Run through and hide all others
            let i;
            let len;
            const elems = document.querySelectorAll('.tc-button');
            for (i = 0, len = elems.length; i < len; i += 1) {
                elems[i].classList.add('huh');
            }

            if (link.classList.contains(className)) {
                link.classList.remove(className);
            } else {
                link.classList.add(className);
            }
        });

        const spanTag = document.createElement('span');
        spanTag.classList.add('tc-span');
        link.style.width = 'auto';
        link.style.float = 'right';
        link.setAttribute('title', 'tc Timer');
        spanTag.appendChild(link);
        container.insertBefore(spanTag, container.lastChild);
    }
);
