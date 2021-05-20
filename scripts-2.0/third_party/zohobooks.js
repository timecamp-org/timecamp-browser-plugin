'use strict';

tcbutton.render(
    '.content-column .btn-toolbar:not(.tc)',
    { observe: true },
    function (elem) {
        const description = function () {
            let first = document.querySelector('.pcs-template-body .pcs-label b');
            let second = document.querySelector('.pcs-template-body #tmp_ref_number');

            first = first ? first.textContent.trim() + ' ' : '';
            second = second ? second.textContent.trim() : '';
            return first + second;
        };

        const project = function () {
            let p = document.querySelector(
                '.pcs-template-body .pcs-customer-name a'
            );
            p = p ? p.textContent.trim() : '';
            return p;
        };

        const link = tcbutton.createTimerLink({
            className: 'zoho-books',
            description: description,
            projectName: project
        });

        elem.appendChild(link);
    }
);
