'use strict';

const SERVICE = 'freshrelease';

tcbutton.render('.entity-wrap:not(.tc)', { observe: true }, function (elem) {
    const desc = $(".entity-title", elem).innerText;
    const ticket = $(".entity-key", elem).innerText;

    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description: "[" + ticket + "] " + desc,
    });
    
    link.style.display = "inline-flex";
    link.style.verticalAlign = "middle";
    link.style.float = "right";
    link.style.paddingRight = "4px";

    $(".entity--header", elem).append(link);
});

tcbutton.render('.app-container:not(.tc)', { observe: true }, function (elem) {
    const desc = $(".title", elem).innerText;
    const ticket = $(".page-action__left", elem).innerText.replace("Tasks ", "");

    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description: "[" + ticket + "] " + desc,
    });
    
    link.style.display = "inline-flex";
    link.style.verticalAlign = "middle";
    link.style.paddingTop = "10px";
    link.style.float = "right";

    $('.title', elem).append(link);
});

tcbutton.render('.ember-modal-header:not(.tc)', { observe: true }, function (elem) {
    const desc = $(".form-inline", elem).innerText;
    const ticket = $(".entity-key", elem).innerText;

    const link = tcbutton.createTimerLink({
        className: SERVICE,
        description: "[" + ticket + "] " + desc,
    });
    
    link.style.display = "inline-flex";
    link.style.verticalAlign = "middle";
    link.style.float = "right";

    $(".summary-title--content", elem).append(link);
});