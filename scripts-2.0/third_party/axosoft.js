'use strict';

tcbutton.render(
    '.item-field-name input:not(.tc)',
    { observe: true },
    function () {
        let titleText;
        const wrapperElem = $('.axo-addEditItem-content');
        const titleElem = $('#name', wrapperElem);
        const beforeElem =
            $('.axo-rating', wrapperElem) || $('.item-field-name', wrapperElem);

        if (titleElem !== null) {
            titleText = titleElem.value;
        }

        const link = tcbutton.createTimerLink({
            className: 'axosoft',
            description: titleText || ''
        });
        link.classList.add('edit');
        beforeElem.parentNode.insertBefore(link, beforeElem);

        return true;
    }
);

tcbutton.render(
    '.axo-view-item-content .item-field-name:not(.tc)',
    { observe: true },
    function () {
        const wrapperElem = $('.axo-view-item-content');
        const titleElem = $('.item-field-name', wrapperElem);
        const beforeElem = $('.axo-rating', wrapperElem) || titleElem;
        let titleText;

        if (titleElem !== null) {
            titleText = titleElem.textContent;
        }

        const link = tcbutton.createTimerLink({
            className: 'axosoft',
            description: titleText || ''
        });
        link.classList.add('view');
        beforeElem.parentNode.insertBefore(link, beforeElem);

        return true;
    }
);
