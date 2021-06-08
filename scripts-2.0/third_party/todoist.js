'use strict';

const TODOIST = 'todoist';
const TASK_NOT_FOUND_INFO = 'todoist_task_not_found_in_backend_integration_info';

const buildExternalIdForAsana = (taskId) => {
    return TODOIST + '_' + taskId
}

//Task view
tcbutton.render(
    '.item_overview_sub:not(.tc)',
    {observe: true},
    elem => {
        const description = () => elem.dataset.itemContent || '';
        const taskId = $$('.reactist_modal_box .sub_items_tab_container .items:first-child')[0].dataset.subitemListId;
        const externalTaskId = buildExternalIdForAsana(taskId);

        if (!externalTaskId) {
            return;
        }

        const link = tcbutton.createTimerLink({
            className: TODOIST,
            additionalClasses: [TODOIST + '__task-view'],
            description: description,
            externalTaskId: externalTaskId,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        elem.appendChild(link);
    }
);

//List view
tcbutton.render(
    '.task_list_item .task_list_item__actions:not(.tc)',
    {observe: true},
    elem => {
        if ($('.tc-button', elem)) {
            return;
        }

        let listItem = elem.closest('.task_list_item');

        const externalTaskId = buildExternalIdForAsana(listItem.dataset.itemId);
        if (!externalTaskId) {
            return;
        }

        const description = () => {
            return $('.task_list_item__content .task_content', listItem).textContent.trim()
        };

        const link = tcbutton.createTimerLink({
            className: TODOIST,
            additionalClasses: [TODOIST + '__task-list'],
            description: description,
            buttonType: 'minimal',
            externalTaskId: externalTaskId,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        elem.appendChild(link);
    }
);

//Board view
tcbutton.render(
    '.board_section__task_list .board_task:not(.tc)',
    {observe: true},
    elem => {
        const externalTaskId = buildExternalIdForAsana(elem.dataset.selectionId);
        if (!externalTaskId) {
            return;
        }

        const description = () => {
            return $('.board_task__details .task_content', elem).textContent.trim()
        };

        const link = tcbutton.createTimerLink({
            className: TODOIST,
            additionalClasses: [TODOIST + '__task-board'],
            description: description,
            buttonType: 'minimal',
            externalTaskId: externalTaskId,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        $('.board_task__details__content', elem).insertAdjacentElement('afterend', link);
    }
);
