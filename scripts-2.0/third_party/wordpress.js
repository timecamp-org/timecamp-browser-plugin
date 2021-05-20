'use strict';

tcbutton.render('#poststuff:not(.tc)', { observe: true }, function (elem) {
    const heading = document.querySelector('.wp-heading-inline');
    const description = function () {
        return elem.querySelector('#title').value;
    };

    const link = tcbutton.createTimerLink({
        className: 'wordpress',
        description: description
    });

    heading.append(link);
});

tcbutton.render('.edit-post-header:not(.tc)', { observe: true }, function (
    elem
) {
    const targetElement = elem.querySelector('.edit-post-header__settings');
    const description = function () {
        const titleInput = document.getElementById('post-title-0');
        return titleInput ? titleInput.value : '';
    };

    const link = tcbutton.createTimerLink({
        className: 'wordpress',
        description: description
    });

    targetElement.prepend(link);
});
