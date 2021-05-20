'use strict';

tcbutton.render('#dokuwiki__content', { observe: false }, function (elem) {
    const numElem = $('.pageId span');
    const pName = numElem.textContent.split(':')[0].trim();
    const target = $('.wrapper.group') || $('.pageId');

    const description = numElem.textContent
        .split(' ')
        .pop()
        .trim();
    const link = tcbutton.createTimerLink({
        className: 'wiki',
        description: description,
        projectName: pName
    });

    target.prepend(link);
});
