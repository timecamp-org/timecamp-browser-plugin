'use strict';

const MONDAY = 'monday';
const TASK_NOT_FOUND_INFO = 'monday_task_not_found_in_backend_integration_info';

const buildExternalIdForMonday = (taskId) => {
    return MONDAY + '_' + taskId;
}

//Table view
tcbutton.render(
    '.pulse-component:not(.tc)',
    {observe: true, debounceInterval: 500},
    elem => {
        const pulseId = elem.id.replace('pulse-', '');
        const externalTaskId = buildExternalIdForMonday(pulseId);
        if (!externalTaskId) {
            return false;
        }

        const alreadyCreatedButton = $('.tc-button', elem);
        if (alreadyCreatedButton) {
            if (externalTaskId !== alreadyCreatedButton.dataset.externalTaskId) {
                alreadyCreatedButton.remove();
            } else {
                return false;
            }
        }

        const description = () => {
            const descField = $('.name-cell .ds-text-component', elem);

            if (!descField) {
                return '';
            }
            return descField.textContent.trim();
        };

        const link = tcbutton.createTimerLink({
            className: MONDAY,
            additionalClasses: [MONDAY + '__table-view'],
            description: description,
            buttonType: 'minimal',
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        $('.name-cell-text', elem).insertAdjacentElement('afterend', link);

        return true;
    }
);

//Calendar view
tcbutton.render(
    '.deadline-task-component:not(.tc)',
    {observe: true, debounceInterval: 500},
    elem => {
        if ($('.tc-button', elem)) {
            return false;
        }

        try {
            const pulseId = $('.button_link', elem).href.split('/').pop();
            const externalTaskId = buildExternalIdForMonday(pulseId);
            if (!externalTaskId) {
                return false;
            }

            const description = () => {
                return $('.pulse-name-text .ds-text-component span', elem).textContent.trim();
            };

            const link = tcbutton.createTimerLink({
                className: MONDAY,
                additionalClasses: [MONDAY + '__calendar-view'],
                description: description,
                buttonType: 'minimal',
                externalTaskId: externalTaskId,
                isBackendIntegration: true,
                taskNotFoundInfo: TASK_NOT_FOUND_INFO
            });

            $('.pulse-name-wrapper .ds-text-component', elem).insertAdjacentElement('beforeend', link);

            return true;
        } catch (e) {
            return false;
        }
    }
);

//Edit view
tcbutton.render(
    '.slide-panel-content .flexible-header:not(.tc)',
    {observe: true, debounceInterval: 500},
    elem => {
        if ($('.tc-button', elem)) {
            return false;
        }

        try {
            const pulseId = document.URL.split('/').pop();

            const externalTaskId = buildExternalIdForMonday(pulseId);
            if (!externalTaskId) {
                return false;
            }

            const description = () => {
                return $('.heading-component', elem).textContent.trim();
            };

            const link = tcbutton.createTimerLink({
                className: MONDAY,
                additionalClasses: [MONDAY + '__edit-view'],
                description: description,
                externalTaskId: externalTaskId,
                isBackendIntegration: true,
                taskNotFoundInfo: TASK_NOT_FOUND_INFO
            });

            $('.item-board-subset-tabs-component .add-board-subset-picker-wrapper', elem).insertAdjacentElement('beforeend', link);

            return true;
        } catch (e) {
            return false;
        }
    }
);
