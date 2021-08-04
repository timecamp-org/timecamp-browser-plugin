'use strict';

tcbutton.render('.PageListItem:not(.tc)', { observe: true }, function (
    elem
) {
    const description = $('.label_title', elem).textContent;

    const link = tcbutton.createTimerLink({
        className: 'processwire',
        description: description,
        buttonType: 'minimal'
    });

    elem.appendChild(link);

    return true;
});

tcbutton.render(
    '.ProcessPageEdit h1:not(.tc)',
    { observe: true },
    function (elem) {
        const description = elem.textContent;

        const link = tcbutton.createTimerLink({
            className: 'processwire',
            description: description,
            buttonType: 'minimal'
        });

        elem.appendChild(link);

        return true;
    }
);
