'use strict';

tcbutton.render(
    '.row:not(.tc), .taskRow:not(.tc)',
    { observe: true },
    function (elem) {
        if (elem.querySelectorAll('.tc-button').length) {
            return;
        }

        const newLayout = $('.tc_title', elem);
        const taskElem = newLayout || $('.task', elem);
        const folderElem = $('.col1', elem) || $('.taskCell:not(.tc_title)', elem);
        let folderName = folderElem && folderElem.firstChild.textContent;

        folderName =
            !folderName || folderName === 'No Folder' ? '' : ' - ' + folderName;

        const link = tcbutton.createTimerLink({
            className: 'toodledo',
            buttonType: 'minimal',
            description: taskElem.textContent + folderName
        });

        const newElem = document.createElement('div');
        newElem.appendChild(link);
        newElem.setAttribute(
            'style',
            (newLayout ? 'display:inline-block;' : 'float:left;') +
            'width:30px;height:20px;'
        );
        if (!newLayout) {
            link.setAttribute('style', 'top:1px;');
        }

        const landmarkElem =
            $('.subm', elem) ||
            $('.subp', elem) ||
            $('.ax', elem) ||
            $('.cellAction', elem) ||
            $('.cellStarSmall', elem);
        landmarkElem.parentElement.insertBefore(newElem, landmarkElem.nextSibling);
    }
);
