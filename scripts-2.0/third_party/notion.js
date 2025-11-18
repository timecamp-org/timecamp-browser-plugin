'use strict';

const TASK_NOT_FOUND_INFO = 'notion_task_not_found_in_backend_integration_info';

const NOTION = 'notion';
const ENTITY_TYPE_PAGE = 'page';
const ENTITY_TYPE_DB = 'db';

const buildExternalIdForNotion = (taskId, entity) => {
    return `${NOTION}_${entity}_${taskId}`;
};

//Item on list
tcbutton.render(
    '.notion-table-view .notion-collection-item:not(.tc)',
    { observe: true, debounceInterval: 500 },
    function (elem) {
        const titleElement = elem.querySelector('.notion-table-view-cell div:nth-child(2)');
        const srcElem = titleElement;
        function getDescription() {
            return titleElement ? titleElement.textContent.trim() : '';
        }

        const externalTaskId = buildExternalIdForNotion(elem?.dataset?.blockId ?? null, ENTITY_TYPE_PAGE);

        if (!externalTaskId) {
            return false;
        }

        if (!srcElem) {
            return false;
        }

        const link = tcbutton.createTimerLink({
            className: 'notion',
            description: getDescription,
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO,
            buttonType: 'minimal'
        });

        srcElem.insertAdjacentElement('beforebegin', link);

        return true;
    }
);

//List view 2
tcbutton.render(
    '.notion-frame .notion-page-controls:not(.tc)',
    { observe: true, debounceInterval: 500 },
    function (elem) {
        const titleElement = elem.parentElement.parentElement.parentElement.querySelector('.notion-selectable');
        const externalTaskId = buildExternalIdForNotion(titleElement?.dataset?.blockId ?? null, ENTITY_TYPE_DB);

        function getDescription() {
            return titleElement ? titleElement.textContent.trim() : '';
        }

        const link = tcbutton.createTimerLink({
            className: 'notion',
            description: getDescription,
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO,
        });

        elem.insertAdjacentElement('afterbegin', link);

        return true;
    }
);