'use strict';

tcbutton.render('._1rGA5291Yki5ZAtnlCWE_6:not(.tc)', { observe: true}, elem => {
    const link = tcbutton.createTimerLink({
        className: 'outlook',
        description: elem.textContent.trim().replace('', '')
    });

    elem.appendChild(link);

    return true;
});
