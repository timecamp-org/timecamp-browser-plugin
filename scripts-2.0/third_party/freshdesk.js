'use strict';
const FRESHDESK = 'freshdesk'

// Freshdesk mint (late 2018)
tcbutton.render('.page-actions__left:not(.tc)', { observe: true }, elem => {
    if ($('.tc-button', elem)) {
        return false;
    }
    const descriptionElem = $('.ticket-subject-heading');

    // if there's no description element it's overview page, don't show
    if (!descriptionElem) {
        return false;
    }

    const descriptionSelector = () => {
        const ticketNumber = $('.breadcrumb__item.active').textContent.trim();
        // Remove other buttons/controls from the ticket subject
        const subjectElement = $('.ticket-subject-heading').cloneNode(true);
        for (const child of subjectElement.children) {
            subjectElement.removeChild(child);
        }

        return `${ticketNumber} ${subjectElement.textContent.trim()}`;
    };

    const link = tcbutton.createTimerLink({
        className: FRESHDESK,
        additionalClasses: [FRESHDESK + '__task-details'],
        description: descriptionSelector,
        tags: () => {
            const tagList = $('.ticket-tags ul');
            if (!tagList ||
                !tagList.children ||
                !tagList.children.length) { return []; }

            return [...tagList.querySelectorAll('li')]
                .map(listItem => {
                    const content = listItem.querySelector('.tag-options');
                    const tag = content ? content.textContent : '';
                    return tag.trim().replace(/[\r\n\t]/ig, ''); /* UI has strange characters in the markup, let's avoid it */
                });
        }
    });

    elem.appendChild(link);
});
