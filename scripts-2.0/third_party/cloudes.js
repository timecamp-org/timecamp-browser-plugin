'use strict';

tcbutton.render('#left-panel:not(.tc)', {}, function () {
    const wrap = createTag('div');
    const prevElem = $('#left-panel .ui-grid-a');
    const cloudesDescription = function () {
        return $('title').textContent;
    };

    const link = tcbutton.createTimerLink({
        className: 'cloudes',
        description: cloudesDescription
    });

    wrap.appendChild(link);
    wrap.className = 'boxedDotted';
    prevElem.parentNode.insertBefore(wrap, prevElem.nextSibling);
});
