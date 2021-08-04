'use strict';

const SERVICE = 'infinity';

tcbutton.render('.item-sidebar .mobile-item-navigation:not(.tc)', {observe: true}, function (elem) {
    setTimeout(function(){
        let description = $('.item-sidebar .item-name');
        
        const link = tcbutton.createTimerLink({
            className: SERVICE,
            description: description.textContent.trim(),
        });
        
        link.style.paddingTop = "0";
        link.style.paddingBottom = "0";
        link.style.cursor = 'pointer';

        elem.appendChild(link);
    }, 300);
    
    return true;
});
