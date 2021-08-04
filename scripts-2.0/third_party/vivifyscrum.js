'use strict';

tcbutton.render('.vs-c-modal--task:not(.tc)', { observe: true }, function (
    elem
) {
    const container = $('.vs-c-modal__actions', elem);
    const descFunc = function () {
        return $('.vs-c-task__title > .vue-simple-markdown', elem).innerText;
    };

    const link = tcbutton.createTimerLink({
        className: 'vivifyscrum',
        description: descFunc,
        buttonType: 'minimal'
    });

    container.prepend(link);

    return true;
});
