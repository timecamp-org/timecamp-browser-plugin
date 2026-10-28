'use strict';

import { buildWrikeTaskIdCandidates } from '../helpers/WrikeTaskIds';

const WRIKE = 'wrike';
const TASK_NOT_FOUND_INFO = 'wrike_task_not_found_in_backend_integration_info';
const SELECTOR = '.navigation-toolbar-wrapper__content .navigation-toolbar';

const renderWrikeButton = elem => {
    const url = new URL(window.location.href);
    const panel = elem.closest('[role="complementary"], [role="dialog"]') || elem.closest('.main-panel');
    const type = panel?.querySelector('.work-item-header__type [data-application]')?.dataset.application;
    // Folder/project IDs must never be sent as task IDs to the timer backend.
    const candidates = type === 'task' ? buildWrikeTaskIdCandidates(
        new URLSearchParams(url.hash.split('?')[1] || '').get('sidePanelItemId') || url.searchParams.get('id'),
        url.searchParams.get('acc')
    ) : undefined;
    const description = panel?.querySelector('[data-application="work-item-title"] textarea')?.value?.trim()
        || elem.textContent?.trim() || '';

    const existingButton = elem.parentNode.parentNode?.querySelector('.tc-button.wrike');
    if (existingButton) {
        if (existingButton.dataset.externalTaskIdCandidates === JSON.stringify(candidates)
            && existingButton.title === description) {
            return false;
        }
        if (tcbutton.lastButtonClicked === existingButton) {
            tcbutton.closeAndRemoveContextMenuContainer();
        }
        existingButton.remove();
    }

    const link = tcbutton.createTimerLink({
        className: WRIKE,
        description,
        externalTaskIdCandidates: candidates,
        isBackendIntegration: true,
        taskNotFoundInfo: TASK_NOT_FOUND_INFO,
    });
    elem.parentNode.insertAdjacentElement('beforebegin', link);
    return true;
};

tcbutton.render(SELECTOR, { observe: true, debounceInterval: 500 }, renderWrikeButton);
window.addEventListener('hashchange', () => tcbutton.renderTo(SELECTOR, renderWrikeButton));
window.addEventListener('popstate', () => tcbutton.renderTo(SELECTOR, renderWrikeButton));
