'use strict';

const WRIKE = 'wrike';
const TASK_NOT_FOUND_INFO = 'wrike_task_not_found_in_backend_integration_info';

const buildExternalIdForWrike = (itemId, itemType) => {
    if (!/^[1-9]\d*$/.test(itemId) || !['task', 'project'].includes(itemType)) {
        return null;
    }

    const numericId = BigInt(itemId);
    // 2^64 - 1: the largest unsigned ID that fits in 8 bytes.
    // Reject larger IDs because setBigUint64 would truncate them.
    if (numericId > BigInt('18446744073709551615')) {
        return null;
    }

    // Wrike's legacy API ID is a type byte followed by an unsigned 64-bit ID.
    const bytes = new Uint8Array(9);
    bytes[0] = itemType === 'task' ? 0x30 : 0x31;
    new DataView(bytes.buffer).setBigUint64(1, numericId, false);

    return WRIKE + '_' + itemType + '_' + btoa(String.fromCharCode(...bytes));
};

tcbutton.render(
    '.navigation-toolbar-wrapper__content .navigation-toolbar',
    { observe: true, debounceInterval: 500 },
    elem => {

        const url = new URL(window.location.href);
        const panel = elem.closest('[role="complementary"], .main-panel');
        const folderId = url.hash.match(/^#\/folder\/(\d+)(?:[/?]|$)/)?.[1];
        const sidePanelItemId = new URLSearchParams(url.hash.split('?')[1] || '').get('sidePanelItemId');
        // An open task takes precedence over its containing project in the URL.
        const itemType = {
            task: 'task',
            project: 'project',
            folder: 'project',
        }[panel?.querySelector('.work-item-header__type [data-application]')?.dataset.application]
            || (!sidePanelItemId && folderId ? 'project' : null);
        const externalTaskId = buildExternalIdForWrike(
            sidePanelItemId || url.searchParams.get('id') || folderId,
            itemType
        );
        const description = panel?.querySelector('[data-application="work-item-title"] textarea')?.value?.trim()
            || elem.textContent?.trim() || '';

        const existingButton = elem.parentNode.previousElementSibling;
        if (existingButton?.matches('.tc-button.wrike')) {
            if (existingButton.dataset.externalTaskId === String(externalTaskId)
                && existingButton.title === description) {
                return false;
            }
            existingButton.remove();
        }

        const link = tcbutton.createTimerLink({
            className: WRIKE,
            description,
            externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO,
        });

        elem.parentNode.insertAdjacentElement('beforebegin', link);

        return true;
    }
);
