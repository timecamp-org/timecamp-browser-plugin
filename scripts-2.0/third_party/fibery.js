'use strict';

const renderTcButton = () => {
    tcbutton.render('div.ObjectEditor:not(.tc)', { observe: true }, $container => {
        const descriptionSelector = () => {
            const $description = $('.HeaderLayout textarea', $container);
            return $description ? $description.textContent.trim() : '';
        };

        const link = tcbutton.createTimerLink({
            className: 'fibery',
            description: descriptionSelector
        });

        $('div.ObjectEditorHeader > .HeaderLayout').appendChild(link);
    });
};

renderTcButton();
