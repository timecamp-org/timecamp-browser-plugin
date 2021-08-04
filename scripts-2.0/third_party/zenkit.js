'use strict';

const SERVICE = 'zenkit';

tcbutton.render('.zenkit-entry-detail-popup-subheader-left:not(.tc)', {observe: true}, function (elem) {
    let description = $('.zenkit-details-view__display-string');

    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description: description.textContent,
    });
    
    elem.append(link);

    return true;
});