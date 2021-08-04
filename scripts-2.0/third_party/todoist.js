'use strict';

const TODOIST = 'todoist';
const TASK_NOT_FOUND_INFO = 'todoist_task_not_found_in_backend_integration_info';

const buildExternalIdForTodoist = (taskId) => {
    return TODOIST + '_' + taskId
}

//Task view
tcbutton.render(
    '.item_overview_sub:not(.tc)',
    {observe: true},
    elem => {
        const description = () => $('.task_content', elem.parentNode).textContent.trim() || '';
        const externalTaskId = () => {
            const taskId = $(
                '.reactist_modal_box .sub_items_tab_container .items:nth-of-type(1)',
                elem.parentNode.parentNode.parentNode
            ).dataset.subitemListId;

            return buildExternalIdForTodoist(taskId);
        };

        if (!externalTaskId()) {
            return false;
        }

        const link = tcbutton.createTimerLink({
            className: TODOIST,
            additionalClasses: [TODOIST + '__task-view'],
            description: description,
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        elem.appendChild(link);

        return true;
    }
);

//List view
tcbutton.render(
    '.task_list_item .task_list_item__actions:not(.tc)',
    {observe: true},
    elem => {
        if ($('.tc-button', elem)) {
            return false;
        }

        let listItem = elem.closest('.task_list_item');

        const externalTaskId = buildExternalIdForTodoist(listItem.dataset.itemId);
        if (!externalTaskId) {
            return false;
        }

        const description = () => {
            return $('.task_list_item__content .task_content', listItem).textContent.trim();
        };

        const link = tcbutton.createTimerLink({
            className: TODOIST,
            additionalClasses: [TODOIST + '__task-list'],
            description: description,
            buttonType: 'minimal',
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        elem.appendChild(link);

        return true;
    }
);

//Board view
tcbutton.render(
    '.board_section__task_list .board_task:not(.tc)',
    {observe: true},
    elem => {
        const externalTaskId = buildExternalIdForTodoist(elem.dataset.selectionId);
        if (!externalTaskId) {
            return false;
        }

        const description = () => {
            return $('.board_task__details .task_content', elem).textContent.trim();
        };

        const link = tcbutton.createTimerLink({
            className: TODOIST,
            additionalClasses: [TODOIST + '__task-board'],
            description: description,
            buttonType: 'minimal',
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        $('.board_task__details__content', elem).insertAdjacentElement('afterend', link);

        return true;
    }
);
