'use strict';

tcbutton.render(
    '.ticketZoom-header:not(.tc)',
    { observe: true },
    $element => {
        const $container = $('.ticketZoom-controls');
        const tcLink = tcbutton.createTimerLink({
            className: 'zammad',
            description: descriptionSelector,
            projectName: projectSelector,
            tags: tagsSelector,
            buttonType: 'minimal'
        });
        appendTcLinkAsButton(tcLink, $container);
    }
);

function appendTcLinkAsButton (tcLink, $container) {
    const spacer = document.createElement('div');
    spacer.className = 'spacer';
    $container.appendChild(spacer);
    const wrapper = document.createElement('div');
    wrapper.className = 'btn btn--action centered';
    wrapper.appendChild(tcLink);
    $container.appendChild(wrapper);
}

function descriptionSelector () {
    const $ticketId = $('.ticket-number');
    const $ticketTitle = $('.ticket-title');
    return (($ticketId) ? '#' + $ticketId.textContent + ': ' : '') + $ticketTitle.textContent.trim();
}

function projectSelector () {
    const client = document.querySelectorAll('[data-tab="customer"] [title="Name"]');
    const organization = document.querySelectorAll('[data-tab="organization"] [title="Name"]');
    let clientName = '';
    if (client.length === 1) {
        clientName = client[0].textContent.trim();
    }
    if (organization.length === 1) {
        clientName += ' (' + organization[0].textContent.trim() + ')';
    }
    return clientName;
}

function tagsSelector () {
    let tags = document.querySelectorAll('.tags .list-item-name');
    tags = tags ? Array.from(tags).map(tag => tag.textContent.trim()) : null;
    return tags;
}
