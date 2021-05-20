'use strict';

tcbutton.render(
    '.fsi-toolbar-content:not(.tc), .toolbar_fsi:not(.tc)',
    { observe: true },
    function (elem) {
        let description;
        const numElem = $('a.issueId');
        const titleElem = $('.issue-summary');

        const projectElem = $(
            '.fsi-properties a[title^="Project"], .fsi-properties .disabled.bold'
        );

        description = titleElem.textContent;
        description =
            numElem.firstChild.textContent.trim() + ' ' + description.trim();

        const link = tcbutton.createTimerLink({
            className: 'youtrack',
            description: description,
            projectName: projectElem ? projectElem.textContent : ''
        });

        elem.insertBefore(link, titleElem);
    }
);

tcbutton.render(
    '.yt-issue-body:not(.tc)',
    { observe: true },
    function (elem) {
        const parent = elem.closest('.yt-issue-view');
        const issueId = parent.querySelector('.js-issue-id').textContent;
        const link = tcbutton.createTimerLink({
            className: 'youtrack',
            description: issueId + ' ' + $('h1').textContent.trim(),
            projectName: issueId.split('-')[0]
        });

        elem.insertBefore(link, $('.yt-issue-view__star'));
    }
);

tcbutton.render('.yt-agile-card:not(.tc)', { observe: true }, function (
    elem
) {
    const container = $('.yt-agile-card__summary', elem);
    const projectName = $('.yt-issue-id').textContent.split('-');

    const description = function () {
        const text = $('.yt-agile-card__summary', elem).textContent;
        const id = $('.yt-agile-card__id ', elem).textContent;
        return (id ? id + ' ' : '') + (text ? text.trim() : '');
    };

    if (projectName.length > 1) {
        projectName.pop();
    }

    const link = tcbutton.createTimerLink({
        className: 'youtrack',
        buttonType: 'minimal',
        description: description,
        projectName: projectName.join('')
    });

    container.appendChild(link);
});
