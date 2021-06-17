'use strict';

tcbutton.render(
    '.notion-peek-renderer:not(.tc)',
    { observe: true },
    function (elem) {
        function getDescription () {
            const descriptionElem = elem.querySelector('.notion-scroller .notion-selectable div[contenteditable="true"]');
            return descriptionElem ? descriptionElem.textContent.trim() : '';
        }

        const link = tcbutton.createTimerLink({
            className: 'notion',
            description: getDescription
        });

        const wrapper = document.createElement('div');
        wrapper.classList.add('tc-button-notion-wrapper');
        wrapper.appendChild(link);

        const root = elem.querySelector('div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(3)');
        if (!root) {
            return false;
        }

        root.prepend(wrapper);

        return true;
    }
);

tcbutton.render(
    '.notion-page-controls + div:not(.tc)',
    { observe: true },
    function (elem) {
        elem.style.position = 'relative';

        function getDescription () {
            const descriptionElem = elem ? elem.querySelector('div[data-root="true"]') : '';

            return descriptionElem ? descriptionElem.textContent.trim() : '';
        }

        const link = tcbutton.createTimerLink({
            className: 'notion',
            buttonType: 'minimal',
            description: getDescription
        });

        elem.prepend(link);

        return true;
    }
);
