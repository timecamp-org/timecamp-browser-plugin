'use strict';

const TRELLO = 'trello';
const TRELLO_EXTERNAL_ID_PREFIX = 'card';
const TASK_NOT_FOUND_INFO = 'trello_task_not_found_in_backend_integration_info';

const buildExternalIdForTrello = (taskId) => {
    return TRELLO_EXTERNAL_ID_PREFIX + '_' + taskId;
}
const getCardIdFromUrl = (url) => {
    const substringToRemoveFromBeginning = "https://trello.com/c/";
    let restOfUrl = url.slice(substringToRemoveFromBeginning.length);

    return restOfUrl.split('/')[0];
}

//Table view
tcbutton.render(
    '.tabbed-pane-main-col div[data-test-class="table-row"]:not(.tc)',
    {observe: true},
    elem => {
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
        let cardId = getCardIdFromUrl(document.URL);

        const externalTaskId = buildExternalIdForTrello(cardId);
        if (!externalTaskId) {
            return;
        }

        const description = () => {
            console.log(elem.parentNode);
            console.log($('.window-title h2', elem.parentNode));
            console.log($('.window-title h2', elem.parentNode).innerText.trim());
            return $('.window-title h2', elem.parentNode).innerText.trim();
        };

        const link = tcbutton.createTimerLink({
            className: TRELLO,
            additionalClasses: [TRELLO + '__card-view'],
            description: description,
            externalTaskId: externalTaskId,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        $('.window-module.u-clearfix  .js-move-card', elem).insertAdjacentElement('beforebegin', link);
    }
);
