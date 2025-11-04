'use strict';

tcbutton.render(
    'span[data-testid="project-title"]:not(.tc)',
    { observe: true },
    function (elem) {
        const description = elem.textContent?.trim();

        console.log({elem, description});
        
        const link = tcbutton.createTimerLink({
            className: 'proworkflow',
            description: description,
        });

        elem.insertAdjacentElement('afterend', link);


        return true;
    }
);
