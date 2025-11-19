'use strict';
const TEAMWORK = 'teamwork';
const TASK_NOT_FOUND_INFO = 'teamwork_task_not_found_in_backend_integration_info';


const buildExternalId = (taskId) => {
    let externalTaskId = '';
    return externalTaskId.concat(
        TEAMWORK,
        '_',
        'task',
        '_',
        taskId,
    );
}

tcbutton.render(
    'div[data-task-details-section="main"] .items-start .text-default:not(.tc)',
    {observe: true, debounceInterval: 500},
    elem => {
        const url = window.location.href;
        if (!url.includes('/app/tasks/')) {
            return false;
        }

        const parts = url.split('/');
        const lastPart = parts[parts.length - 1];
        if (isNaN(lastPart)) {
            return false;
        }

        const description = elem.textContent?.trim();
        const externalTaskId = buildExternalId(lastPart);
        if (!externalTaskId) {
            return false;
        }

        const link = tcbutton.createTimerLink({
            className: TEAMWORK,
            description: description,
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        elem.insertAdjacentElement('beforeend', link);

        return true;
    }
);
