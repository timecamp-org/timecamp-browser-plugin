'use strict';

tcbutton.render('.entryHeader:not(.tc)', { observe: true }, function (
    elem
) {
    const textnode = document.createTextNode('\u00A0//\u00A0 ');
    const description = $('.entryTitle', elem).textContent;

    const link = tcbutton.createTimerLink({
        className: 'feedly',
        description: description
    });

    elem.querySelector('.entryHeader > .metadata').appendChild(textnode);
    elem.querySelector('.entryHeader > .metadata').appendChild(link);
});
