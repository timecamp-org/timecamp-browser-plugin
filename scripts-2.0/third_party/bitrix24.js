'use strict';

tcbutton.render(
    '.crm-kanban-item .crm-kanban-item-title:not(.tc)',
    { observe: true },
    elem => {
        const link = tcbutton.createTimerLink({
            className: 'bitrix24',
            description: elem.textContent?.trim(),
            buttonType: "minimal",
        });

        elem.insertAdjacentElement("afterend", link);

        return true;
    }
);
