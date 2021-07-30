'use strict';

const TRELLO = 'trello';
const TRELLO_EXTERNAL_ID_PREFIX = 'card';
const TASK_NOT_FOUND_INFO = 'trello_task_not_found_in_backend_integration_info';
const TRELLO_URL_SUBSTRING = 'https://trello.com/c/';

const buildExternalIdForTrello = (taskId) => {
    return TRELLO_EXTERNAL_ID_PREFIX + '_' + taskId;
}
const getCardIdFromUrl = (url) => {
    let restOfUrl = url.slice(TRELLO_URL_SUBSTRING.length);

    return restOfUrl.split('/')[0];
}

const checkForTimecampPowerUp = () => {
    let buttons = $$('.board-header-plugin-btns');
    for (let i = 0, len = buttons.length; i < len; i++) {
        if (buttons[i].textContent === 'TimeCamp') {
            return true;
        }
    }

    return false;
};

//Table view
tcbutton.render(
    '.tabbed-pane-main-col div[data-test-class="table-row"]:not(.tc)',
    {observe: true},
    elem => {
        let isTimecampPowerUpOn = checkForTimecampPowerUp();
        if (isTimecampPowerUpOn) {
            return false;
        }

        let aElem = $('a', elem);
        let cardId = getCardIdFromUrl(aElem.href);

        const externalTaskId = buildExternalIdForTrello(cardId);
        if (!externalTaskId) {
            return;
        }

        const description = () => {
            return $('a span', elem).textContent.trim();
        };

        const link = tcbutton.createTimerLink({
            className: TRELLO,
            additionalClasses: [TRELLO + '__table-view'],
            description: description,
            buttonType: 'minimal',
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        $('a', elem).insertAdjacentElement('beforeend', link);
    }
);

//Board view
tcbutton.render(
    '.list-card:not(.tc)',
    {observe: true, debounceInterval: 2000},
    elem => {
        let isTimecampPowerUpOn = checkForTimecampPowerUp();
        if (isTimecampPowerUpOn) {
            return false;
        }

        let cardId = getCardIdFromUrl(elem.href);

        const externalTaskId = buildExternalIdForTrello(cardId);
        if (!externalTaskId) {
            return;
        }

        const description = () => {
            return $('.list-card-title', elem).innerText.trim();
        };

        const link = tcbutton.createTimerLink({
            className: TRELLO,
            additionalClasses: [TRELLO + '__board-view'],
            description: description,
            buttonType: 'minimal',
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        $('.badges', elem).insertAdjacentElement('beforeend', link);
    }
);

//Card view
tcbutton.render(
    '.window-sidebar:not(.tc)',
    {observe: true},
    elem => {
        let isTimecampPowerUpOn = checkForTimecampPowerUp();
        if (isTimecampPowerUpOn) {
            return false;
        }

        let cardId = getCardIdFromUrl(document.URL);

        const externalTaskId = buildExternalIdForTrello(cardId);
        if (!externalTaskId) {
            return;
        }

        const description = () => {
            return $('.window-title h2', elem.parentNode).innerText.trim();
        };

        const link = tcbutton.createTimerLink({
            className: TRELLO,
            additionalClasses: [TRELLO + '__card-view'],
            description: description,
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        $('.window-module.u-clearfix  .js-move-card', elem).insertAdjacentElement('beforebegin', link);
    }
);
