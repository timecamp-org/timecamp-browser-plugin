'use strict';

tcbutton.render('.issue_view:not(.tc)', {}, function (elem) {
    const issueId = $('#issue_overview', elem).getAttribute('data-issue-id');
    const description = $('#issue_overview #issue_summary', elem).textContent;

    const projectSelect = $(
        '#project_chooser > form > select[name=current_project]',
        elem
    );
    const project = projectSelect
        ? projectSelect.options[projectSelect.selectedIndex].text
        : $('#project_chooser').textContent.replace(/^\s+Project:\s/, '');

    const link = tcbutton.createTimerLink({
        className: 'eventum',
        description: '#' + issueId + ' ' + description,
        projectName: project,
        tags: getTags
    });

    const container = $('div#issue_menu', elem);
    const spanTag = document.createElement('span');
    container.parentNode.appendChild(spanTag.appendChild(link));
});

function getTags () {
    const customFields = getCustomFields();

    return Object.values(customFields);
}

function getCustomFields () {
    const fields = {};
    const $rows = document.querySelectorAll('div.issue_section#custom_fields>div.content>table>tbody>tr');

    if (!$rows) {
        return fields;
    }

    for (const $row of Object.values($rows)) {
        const $cells = $row.children;
        const fieldName = $cells[0].textContent.trim();
        const fieldValue = $cells[1].textContent.trim();

        if (!fieldValue) {
            continue;
        }
        fields[fieldName] = fieldValue;
    }

    return fields;
}
