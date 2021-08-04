'use strict';

tcbutton.render(
    '.action:not(.tc)', { observe: true }, function (elem) {
        let name = elem.querySelector('.action__title');

        if (name == null) name = '';
        const link = tcbutton.createTimerLink({
            className: 'focuster',
            description: name.textContent,
            buttonType: 'minimal'
        });
        const linkContainer = document.createElement('div');
        linkContainer.className = 'meta-item is-active';
        linkContainer.append(link);

        elem.querySelector('.meta-list').prepend(linkContainer);

        return true;
    }
);
