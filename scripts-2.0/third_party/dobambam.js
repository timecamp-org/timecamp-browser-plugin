'use strict';

tcbutton.render('.taskScroll:not(.tc)', { observe: true }, function (
    elem
) {
    let description = $('.jQ_taskTitleEl a', elem);
    if (!description) {
        description = $('.jQ_taskTitleEl', elem);
    }
    const project = $('.txt-gry .jhtmlTicketsTicketViewItem .jQ_trigger', elem);

    const link = tcbutton.createTimerLink({
        className: 'dobambam',
        description: description && description.textContent.trim(),
        projectName: project && project.textContent.trim()
    });

    if ($('section.jQ_taskHeader')) {
        $('section.jQ_taskHeader').appendChild(link);
    }
});
