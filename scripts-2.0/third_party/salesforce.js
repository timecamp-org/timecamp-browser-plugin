'use strict';
const SALESFORCE = 'salesforce';
const TASK_NOT_FOUND_INFO = 'salesforce_task_not_found_in_backend_integration_info';

const PREFIX_CASE = 'case';
const PREFIX_OPPORTUNITY = 'opportunity';
const PREFIX_TASK = 'task';
const PREFIX_ACCOUNT = 'account';

const DEBOUNCE_INTERVAL = 2000;

const buildExternalIdForSalesforce = (taskId, prefix) => {
    let externalTaskId = '';
    return externalTaskId.concat(
        SALESFORCE,
        '_',
        prefix,
        '_',
        taskId,
    );
}

const findIdInUrl = () => {
    const idRegex = /\b[a-z0-9]\w{4}0\w{12}|[a-z0-9]\w{4}0\w{9}\b/;
    const matches = window.location.href.match(idRegex);
    if (matches.length > 0) {
        return matches[0];
    } else {
        return false;
    }
}

//Cases list view
tcbutton.render(
    '.slds-table tbody tr:not(.tc)',
    {observe: true, debounceInterval: DEBOUNCE_INTERVAL},
    elem => {
        if (!window.location.href.includes('/Case/')) {
            return false;
        }

        const description = elem.querySelector('th + td a').textContent.trim();
        const taskId = elem.querySelector('th a').dataset.recordid;
        const externalTaskId = buildExternalIdForSalesforce(
            taskId,
            PREFIX_CASE
        );
        if (!externalTaskId) {
            return false;
        }

        const link = tcbutton.createTimerLink({
            className: SALESFORCE,
            additionalClasses: [SALESFORCE + '__case-list-view'],
            description: description,
            buttonType: 'minimal',
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        const injectContainer = elem.querySelector('th a');
        if (!injectContainer) {
            return false;
        }

        injectContainer.insertAdjacentElement('afterend', link);

        return true;
    }
);

//Opportunities list view
tcbutton.render(
    '.slds-table tbody tr:not(.tc)',
    {observe: true, debounceInterval: DEBOUNCE_INTERVAL},
    elem => {
        if (!window.location.href.includes('/Opportunity/')) {
            return false;
        }

        const description = elem.querySelector('th a').textContent.trim();
        const taskId = elem.querySelector('th a').dataset.recordid;
        const externalTaskId = buildExternalIdForSalesforce(
            taskId,
            PREFIX_OPPORTUNITY
        );
        if (!externalTaskId) {
            return false;
        }

        const link = tcbutton.createTimerLink({
            className: SALESFORCE,
            additionalClasses: [SALESFORCE + '__opportunity-list-view'],
            description: description,
            buttonType: 'minimal',
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        const injectContainer = elem.querySelector('th a');
        if (!injectContainer) {
            return false;
        }

        injectContainer.insertAdjacentElement('afterend', link);

        return true;
    }
);

//Tasks list view
tcbutton.render(
    '.slds-split-view__list-item:not(.tc)',
    {observe: true, debounceInterval: DEBOUNCE_INTERVAL},
    elem => {
        if (!window.location.href.includes('/Task/')) {
            return false;
        }

        const description = $('.uiOutputText', elem).textContent.trim();
        const taskId = $('a', elem).dataset.recordid;
        const externalTaskId = buildExternalIdForSalesforce(
            taskId,
            PREFIX_TASK
        );
        if (!externalTaskId) {
            return false;
        }

        const link = tcbutton.createTimerLink({
            className: SALESFORCE,
            additionalClasses: [SALESFORCE + '__task-list-view'],
            description: description,
            buttonType: 'minimal',
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        const injectContainer = elem.querySelector('a');
        if (!injectContainer) {
            return false;
        }

        injectContainer.insertAdjacentElement('afterend', link);

        return true;
    }
);

//Accounts list view
tcbutton.render(
    '.slds-table tbody tr:not(.tc)',
    {observe: true, debounceInterval: DEBOUNCE_INTERVAL},
    elem => {
        if (!window.location.href.includes('/Account/')) {
            return false;
        }

        const description = elem.querySelector('th a').textContent.trim();
        const taskId = elem.querySelector('th a').dataset.recordid;
        const externalTaskId = buildExternalIdForSalesforce(
            taskId,
            PREFIX_ACCOUNT
        );
        if (!externalTaskId) {
            return false;
        }

        const link = tcbutton.createTimerLink({
            className: SALESFORCE,
            additionalClasses: [SALESFORCE + '__account-list-view'],
            description: description,
            buttonType: 'minimal',
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        const injectContainer = elem.querySelector('th a');
        if (!injectContainer) {
            return false;
        }

        injectContainer.insertAdjacentElement('afterend', link);

        return true;
    }
);

//Case view
tcbutton.render(
    '.slds-page-header__title:not(.tc)',
    {observe: true, debounceInterval: DEBOUNCE_INTERVAL},
    elem => {
        if (window.location.href.indexOf("/o/") !== -1) {
            return false;
        }
        if (!window.location.href.includes('/Case/')) {
            return false;
        }
        const taskId = findIdInUrl();
        if (taskId === false) {
            return false;
        }

        const description = $('div', elem).textContent.trim();
        const externalTaskId = buildExternalIdForSalesforce(
            taskId,
            PREFIX_CASE
        );
        if (!externalTaskId) {
            return false;
        }

        const link = tcbutton.createTimerLink({
            className: SALESFORCE,
            additionalClasses: [SALESFORCE + '__case-view'],
            description: description,
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        elem.insertAdjacentElement('afterend', link);

        return true;
    }
);

//Opportunity view
tcbutton.render(
    '.slds-page-header__title:not(.tc)',
    {observe: true, debounceInterval: DEBOUNCE_INTERVAL},
    elem => {
        if (window.location.href.indexOf("/o/") !== -1) {
            return false;
        }
        if (!window.location.href.includes('/Opportunity/')) {
            return false;
        }
        const taskId = findIdInUrl();
        if (taskId === false) {
            return false;
        }

        const description = $('slot', elem).textContent.trim();
        const externalTaskId = buildExternalIdForSalesforce(
            taskId,
            PREFIX_OPPORTUNITY
        );
        if (!externalTaskId) {
            return false;
        }

        const link = tcbutton.createTimerLink({
            className: SALESFORCE,
            additionalClasses: [SALESFORCE + '__opportunity-view'],
            description: description,
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        elem.insertAdjacentElement('afterend', link);

        return true;
    }
);

//Tasks view
tcbutton.render(
    '.slds-page-header__title:not(.tc)',
    {observe: true, debounceInterval: DEBOUNCE_INTERVAL},
    elem => {
        if (window.location.href.indexOf("/o/") !== -1) {
            return false;
        }
        if (!window.location.href.includes('/Task/')) {
            return false;
        }
        const taskId = findIdInUrl();
        if (taskId === false) {
            return false;
        }

        const description = $('.uiOutputText', elem).textContent.trim();
        const externalTaskId = buildExternalIdForSalesforce(
            taskId,
            PREFIX_TASK
        );
        if (!externalTaskId) {
            return false;
        }

        const link = tcbutton.createTimerLink({
            className: SALESFORCE,
            additionalClasses: [SALESFORCE + '__task-view'],
            description: description,
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        elem.insertAdjacentElement('afterend', link);

        return true;
    }
);


//Tasks view
tcbutton.render(
    '.slds-page-header__title:not(.tc)',
    {observe: true, debounceInterval: DEBOUNCE_INTERVAL},
    elem => {
        if (window.location.href.indexOf("/o/") !== -1) {
            return false;
        }
        if (!window.location.href.includes('/Account/')) {
            return false;
        }
        const taskId = findIdInUrl();
        if (taskId === false) {
            return false;
        }

        const description = $('.uiOutputText', elem).textContent.trim();
        const externalTaskId = buildExternalIdForSalesforce(
            taskId,
            PREFIX_ACCOUNT
        );
        if (!externalTaskId) {
            return false;
        }

        const link = tcbutton.createTimerLink({
            className: SALESFORCE,
            additionalClasses: [SALESFORCE + '__account-view'],
            description: description,
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        elem.insertAdjacentElement('afterend', link);

        return true;
    }
);
