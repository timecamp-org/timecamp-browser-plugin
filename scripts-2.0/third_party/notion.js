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
    '.notion-topbar-action-buttons:not(.tc)',
    { observe: true },
    function (elem) {
        elem.style.position = 'relative';

        function getDescription () {
            const controls = document.querySelector('.notion-page-controls');
            const topBar = document.querySelector('.notion-topbar');
            let title = '';
      
            if (controls) {
              if (controls.nextElementSibling) {
                title = controls.nextElementSibling;
              } else {
                const parent = controls.parentElement;
      
                if (!parent) return '';
      
                title = parent ? parent.nextElementSibling : '';
              }
            } else if (topBar) {
              const breadcrumbs = topBar.querySelector('div > .notranslate')
              if (breadcrumbs) {
                title = breadcrumbs.childNodes[breadcrumbs.childNodes.length - 1].querySelector('.notranslate:last-child')
              }
            }
      
            return title ? title.textContent.trim() : '';
        }

        const link = tcbutton.createTimerLink({
            className: 'notion',
            description: getDescription
        });
        link.style.marginRight = '10px'

        elem.prepend(link);

        return true;
    }
);
