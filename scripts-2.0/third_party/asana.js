'use strict';
const ASANA = 'asana';
const TASK_NOT_FOUND_INFO = 'asana_task_not_found_in_backend_integration_info';

const buildExternalIdForAsana = (taskId) => {
    return ASANA + '_' + taskId
}

//Board view
tcbutton.render(
    '.BaseCard .BoardCardLayout:not(.tc)',
    {observe: true,},
    elem => {
        if ($('.tc-button', elem)) {
            return;
        }
        
        const description = elem.querySelector('.BoardCard-taskName').textContent.trim();
        const externalTaskId = buildExternalIdForAsana(
            elem.dataset.taskId
        );
        if (!externalTaskId) {
            return;
        }
        
        const link = tcbutton.createTimerLink({
            className: ASANA,
            additionalClasses: [ASANA + '__board-view'],
            description: description,
            buttonType: 'minimal',
            externalTaskId: externalTaskId,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });
        
        const injectContainer = elem.querySelector('.BoardCardLayout-actionButtons');
        if (injectContainer) {
            injectContainer.insertAdjacentElement('afterbegin', link);
        }
    }
);

//List view
tcbutton.render(
    '.SpreadsheetRow .SpreadsheetTaskName:not(.tc)', 
    { observe: true },
    (elem) => {
        if ($('.tc-button', elem.parentNode)) {
            return;
        }
        
        //child textaread id split
        const description = elem.querySelector('textarea').textContent.trim();
        const externalTaskId = buildExternalIdForAsana(
            $('textarea.SpreadsheetTaskName-input', elem).id.split('_').pop()
        );
        if (!externalTaskId) {
            return;
        }
        
        const link = tcbutton.createTimerLink({
            className: ASANA,
            additionalClasses: [ASANA + '__list-view'],
            description: description,
            buttonType: 'minimal',
            externalTaskId: externalTaskId,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        elem.insertAdjacentElement('afterend', link);
    }
);

//Task details
tcbutton.render(
    '.SingleTaskPaneSpreadsheet:not(.tc)',
    { observe: true },
    (elem) => {
        const description = $('.SingleTaskPaneSpreadsheet-titleRowInput textarea', elem).textContent.trim();
        const externalTaskId = buildExternalIdForAsana(
            elem.dataset.taskId
        );
        if (!externalTaskId) {
            return;
        }
        
        const link = tcbutton.createTimerLink({
            className: ASANA,
            additionalClasses: [ASANA + '__task-details'],
            description: description,
            externalTaskId: externalTaskId,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        const firstButton = elem.querySelector('.SingleTaskPaneToolbar-button');
        firstButton.parentNode.insertBefore(link, firstButton);
    }
);

//Subtasks
tcbutton.render(
    '.ItemRowTwoColumnStructure-left:not(.tc)', 
    {observe: true}, 
    (elem) => {
        let description = $('.simpleTextarea.AutogrowTextarea-input', elem).textContent.trim();

        const externalTaskId = buildExternalIdForAsana(
            elem.parentNode.dataset.taskId
        );
        if (!externalTaskId) {
            return;
        }
        
        const link = tcbutton.createTimerLink({
            className: ASANA,
            additionalClasses: [ASANA + '__subtasks'],
            description: description,
            buttonType: 'minimal',
            externalTaskId: externalTaskId,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });
        
        elem.appendChild(link);
    }
);
