'use strict';

tcbutton.render(
    '.card-view:not(.tc)',
    { observe: true },
    (elem) => {
        const buildTaskTitle = () => {
            const cardRef = $('.card-view-header a.ref', elem) || false;

            if (!cardRef || !cardRef.innerHTML) {
                return false;
            }

            const cardId = cardRef.innerHTML;
            const cardTitle = $('.card-view-header h2', elem) && $('.card-view-header h2', elem).textContent;
            return `${cardId} ${cardTitle}`;
        };

        const descElem = $('.card-view-attributes-form', elem);
        const container = createTag('div', 'kt-card-tc-btn');
        const taskTitle = buildTaskTitle();

        if (!descElem || !taskTitle) {
            return false;
        }

        const getTags = () => {
            const tags = [];
            const tagItems = document.querySelectorAll('.attribute-type-group-type .group', elem);

            if (!tagItems) {
                return tags;
            }

            for (const index in tagItems) {
                if (tagItems.hasOwnProperty(index)) {
                    tags.push(tagItems[index].textContent.trim());
                }
            }
            return tags;
        };

        const link = tcbutton.createTimerLink({
            className: 'kantree',
            description: taskTitle,
            projectName: getProjTitle,
            calculateTotal: true,
            tags: getTags
        });

        container.appendChild(link);
        descElem.parentNode.insertBefore(container, descElem);

        return true;
    },
    '#card-modal-host, .card-modal'
);

tcbutton.render(
    '.card-tile-content:not(.tc)',
    { observe: true },
    function (elem) {
        const subTaskRef = $('.ref', elem) || false;

        if (!subTaskRef) {
            return false;
        }

        const buildDesc = () => {
            let desc = false;
            try {
                const taskDesc = $('.title', elem).textContent.trim();
                const cardRef = $('.card-view-header a.ref').textContent.trim();
                desc = `Subtask ${taskId}: ${taskDesc} (on task ${cardRef})`;
            } catch (e) {}
            return desc;
        };

        const taskId = subTaskRef.textContent.trim();

        const link = tcbutton.createTimerLink({
            className: 'kantree',
            buttonType: 'minimal',
            description: buildDesc,
            projectName: getProjTitle
        });

        link.classList.add('kt-checklist-item-tc-btn');

        if (!taskId) {
            // run tc after sub-task creation.
            setTimeout(function () {
                subTaskRef.parentNode.prepend(link);
            }, 2000);
        } else {
            subTaskRef.parentNode.prepend(link);
        }

        return true;
    },
    '.card-view-children .children .card-tile, #card-modal-host, .card-modal'
);

function getProjTitle () {
    const $selector = $('.board-nav-title .title') || $('.project-panel-title');
    return $selector
        ? $selector.textContent.trim()
        : '';
}
