'use strict';

const CLICKUP = 'clickup';
const CLICKUP_EXTERNAL_ID_PREFIX = 'task';
const TASK_NOT_FOUND_INFO = 'clickup_task_not_found_in_backend_integration_info';

const buildExternalIdForClickUp = (taskId) => {
    return CLICKUP_EXTERNAL_ID_PREFIX + '_' + taskId;
};

const getTaskIdFromUrl = (url) => {
    let lastUrlSegmentStartIndex = url.lastIndexOf('/') + 1;

    return url.substring(lastUrlSegmentStartIndex);
};

//Task view
tcbutton.render(
    '.cu-task-hero-section__actions .cu-task-hero-actions .container:not(.tc)',
    {observe: true},
    elem => {
        let taskId = getTaskIdFromUrl(document.URL);
        if (!taskId) {
            return false;
        }

        const externalTaskId = buildExternalIdForClickUp(taskId);
        const description = () => {
            const note = $('[data-test="task-title__title-overlay"]')?.textContent.trim() ?? '';

            return note;
        };

        const link = tcbutton.createTimerLink({
            className: CLICKUP,
            additionalClasses: [CLICKUP + '__task-view'],
            description: description,
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        elem.insertAdjacentElement('afterend', link);

        return true;
    }
);
