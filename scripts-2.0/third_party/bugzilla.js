'use strict';

tcbutton.render('input[name=id]', {}, function (elem) {
    const description = elem.value;

    const link = tcbutton.createTimerLink({
        className: 'bugzilla',
        description: description,
        projectName: 'Bugs'
    });

    const targetElement = $('#summary_alias_container') || $('#summary_container');

    if (targetElement === null) {
        return false;
    }

    targetElement.appendChild(link);

    return true;
});
