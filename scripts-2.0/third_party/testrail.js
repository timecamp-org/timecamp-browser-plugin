'use strict';

tcbutton.render(
    '.content-header:not(.tc)',
    { observe: true },
    function () {
        const id = $('div.content-header-id').textContent;
        const title = $('div.content-header-title').textContent.trim();
        const description = '#' + id + ' ' + title;

        const link = tcbutton.createTimerLink({
            className: 'testrail',
            description: description
        });

        link.setAttribute('style', 'margin-left: 5px');

        $('div.content-header-title').appendChild(link);

        return true;
    }
);
