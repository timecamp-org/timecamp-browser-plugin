'use strict';

tcbutton.render('#edit_menu_group:not(.tc)', { observe: true }, function (
    elem
) {
    const description = $('title').textContent.trim();
    const link = tcbutton.createTimerLink({
        className: 'draftin',
        description: description
    });

    elem.parentNode.insertBefore(link, elem);

    return true;
});
