'use strict';

const MONDAY = 'monday';
const TASK_NOT_FOUND_INFO = 'monday_task_not_found_in_backend_integration_info';

const buildExternalIdForMonday = (taskId) => {
    return MONDAY + '_' + taskId;
}

//Table view
tcbutton.render(
    '.pulse-component',
    {observe: true, debounceInterval: 500},
    elem => {
        const pulseId = elem.id.match(/\d+/g);
        if (!pulseId){
            return false;
        }
        const externalTaskId = buildExternalIdForMonday(pulseId[1] ?? pulseId[0]);
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

//Edit view
tcbutton.render(
    '.item-page-header-title-section .item-page-item-name h2',
    {observe: true, debounceInterval: 50},
    elem => {
        try {
            const pulseId = document.URL.split('/').pop();

            const externalTaskId = buildExternalIdForMonday(pulseId);
            if (!externalTaskId) {
                return false;
            }

            const insertTarget = elem.parentElement.parentElement.parentElement.parentElement.parentElement;
            const alreadyCreatedButtons = $$('.tc-button.monday__edit-view', insertTarget.parentElement);

            if (alreadyCreatedButtons.length > 0) {
                const buttonsArray = Array.from(alreadyCreatedButtons);

                const correctButtons = buttonsArray.filter(button => {
                    return button.dataset.externalTaskId === externalTaskId;
                });
                const incorrectButtons = buttonsArray.filter(button => {
                    return button.dataset.externalTaskId !== externalTaskId;
                });

                if (correctButtons.length) {
                    correctButtons.slice(1).forEach(button => button.remove());
                }

                incorrectButtons.forEach(button => button.remove());

                return false;
            }

            const description = () => {
                return elem?.textContent?.trim()
            };

            const link = tcbutton.createTimerLink({
                className: MONDAY,
                additionalClasses: [MONDAY + '__edit-view'],
                description: description,
                externalTaskId: externalTaskId,
                isBackendIntegration: true,
                taskNotFoundInfo: TASK_NOT_FOUND_INFO
            });

            insertTarget.insertAdjacentElement('afterend', link);

            return true;
        } catch (e) {
            return false;
        }
    }
);
