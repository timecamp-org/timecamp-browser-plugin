'use strict';

tcbutton.render('#docs-bars:not(.tc)', {}, function () {
    const titleFunc = function () {
        const title = $('.docs-title-input');
        return title ? title.value : '';
    };

    const link = tcbutton.createTimerLink({
        className: 'google-docs',
        description: titleFunc,
    });
    $('#docs-menubar').appendChild(link);

    return true;
});
