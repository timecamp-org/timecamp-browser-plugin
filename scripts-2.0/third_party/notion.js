'use strict';

const TASK_NOT_FOUND_INFO = 'notion_task_not_found_in_backend_integration_info';

const NOTION = 'notion';
const ENTITY_TYPE_PAGE = 'page';
const ENTITY_TYPE_DB = 'db';

const buildExternalIdForNotion = (taskId, entity) => {
    return `${NOTION}_${entity}_${taskId}`;
};

//Item view
tcbutton.render(
    '.notion-peek-renderer:not(.tc)',
    { observe: true, debounceInterval: 500 },
    function (elem) {
        const titleElement = elem.querySelectorAll('.notion-scroller .notion-page-block')[0] ?? null;
        function getDescription () {
            return titleElement ? titleElement.textContent.trim() : '';
        }

        const externalTaskId = buildExternalIdForNotion(titleElement?.dataset?.blockId ?? null, ENTITY_TYPE_PAGE);
        const link = tcbutton.createTimerLink({
            className: 'notion',
            description: getDescription,
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO,
        });

        const wrapper = document.createElement('div');
        wrapper.classList.add('tc-button-notion-wrapper');
        wrapper.appendChild(link);

        const root = elem.querySelector('div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(3)');
        if (!root) {
            return false;
        }

        root.prepend(wrapper);

        return true;
    }
);

//List view 2
tcbutton.render(
    '.notion-frame .notion-page-controls:not(.tc)',
    { observe: true, debounceInterval: 500  },
    function (elem) {
        const titleElement = elem.parentElement.parentElement.parentElement.querySelectorAll('.notion-selectable')[0] ?? null;
        const externalTaskId = buildExternalIdForNotion(titleElement?.dataset?.blockId ?? null, ENTITY_TYPE_DB);

        function getDescription () {
            return titleElement ? titleElement.textContent.trim() : '';
        }

        const link = tcbutton.createTimerLink({
            className: 'notion',
            description: getDescription,
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO,
        });

        elem.prepend(link);

        return true;
    }
);