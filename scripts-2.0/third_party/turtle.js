'use strict';

const join = (elements) => {
    return Array.from(elements).map(item => item.textContent).join('');
};

const getDescription = (element) => {
    const currentTitleNodes = element
        .querySelectorAll('.title-text');

    if (!element.closest('.card-node').parentElement.closest('.card-node')) {
        return join(currentTitleNodes);
    }

    const sectionTitleNodes = element
        .closest('.card-node')
        .parentElement
        .closest('.card-node')
        .querySelector('a:first-child .wrap-with-text')
        .querySelectorAll('.title-text');

    return `${join(sectionTitleNodes)} – ${join(currentTitleNodes)}`;
};

const getProject = () => {
    return document.querySelector('.project-selector-caret').textContent;
};

tcbutton.render('.card-list-wrapper .card-node:not([data-tc])', { observe: true }, (element) => {
    const description = getDescription(element);
    const project = getProject();
    const wrapper = document.createElement('div');
    wrapper.classList.add('turtle-tc-wrapper');

    const link = tcbutton.createTimerLink({
        className: 'turtle',
        description: description,
        projectName: project,
        buttonType: 'minimal'
    });

    link.addEventListener('mousedown', event => {
        event.preventDefault();
        event.stopImmediatePropagation();
    });

    wrapper.appendChild(link);
    element.setAttribute('data-tc', true);
    element.querySelector('.inline-actions').insertBefore(wrapper, element.querySelector('.more-actions-btn'));

    return true;
});
