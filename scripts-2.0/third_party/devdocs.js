'use strict';

tcbutton.render('._nav:not(.tc)', { observe: true }, function () {
    const getDescription = function () {
        return document.title;
    };

    const link = tcbutton.createTimerLink({
        className: 'devdocs',
        description: getDescription
    });

    const nav = $('nav._nav');

    if (nav) {
        link.classList.add('_nav-link');
        link.style.marginTop = '0.8rem';
        nav.insertBefore(link, nav.firstChild);
    }
});
