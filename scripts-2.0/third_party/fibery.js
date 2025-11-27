'use strict';

const renderTcButton = () => {
    tcbutton.render('.object_panel:not(.tc)', { observe: true }, $container => {
        const descriptionSelector = () => {
            const $description = $('textarea', $container);
            return $description ? $description.textContent.trim() : '';
        };

        const link = tcbutton.createTimerLink({
            className: 'fibery',
            description: descriptionSelector
        });

        $('.content_header', $container).insertAdjacentElement('beforebegin', link);

        return true;
    });
};

renderTcButton();
