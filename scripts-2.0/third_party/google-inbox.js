'use strict';

tcbutton.render('.bJ:not(.tc)', { observe: true }, function (elem) {
    const description = $('.eo > span', elem).textContent;
    const toolbar = $('.iK', elem);

    const link = tcbutton.createTimerLink({
        className: 'google-inbox',
        description: description,
        buttonType: 'minimal'
    });

    toolbar.parentElement.insertBefore(link, toolbar);

    return true;
});
