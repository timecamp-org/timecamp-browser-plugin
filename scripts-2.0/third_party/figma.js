'use strict';

tcbutton.render('.multiplayer_view--multiplayerView--19Y20:not(.tc)', {observe: true}, function (elem) {
    let description = document.title.replace(" – Figma", "");
    let project = $('[data-tooltip-key="editor-folder-name"]').innerText;
    
    const link = tcbutton.createTimerLink({
        className: 'figma',
        description: description,
        projectName: project,
        buttonType: 'minimal',
    });
    
    elem.prepend(link);
});