'use strict';
const PODIO = 'podio';
const TASK_NOT_FOUND_INFO = 'podio_task_not_found_in_backend_integration_info';

const buildExternalIdForPodio = (type, dataId) => {
    let prefix = '';
    switch (type)
    {
        case 'app':
            prefix = 'a';
            break;

        case 'item':
            prefix = 'i';
            break;
    }

    return PODIO + '_' + prefix + dataId
}

const podioCreateTimerButton = (type, elem, titleSelector, podioId, cssClassName, buttonType) => {
    if ($('.tc-button', elem)) {
        return false;
    }

    let titleElem = $(titleSelector, elem);
    if (!titleElem) {
        return false;
    }

    const description = titleElem.innerText.trim();
    const externalTaskId = buildExternalIdForPodio(
        type,
        podioId
    );

    if (!externalTaskId) {
        return false;
    }

    return tcbutton.createTimerLink({
        className: PODIO,
        additionalClasses: [PODIO + '__' + cssClassName],
        description: description,
        buttonType,
        externalTaskId: externalTaskId,
        taskNotFoundInfo: TASK_NOT_FOUND_INFO
    });
}


const podioRenderTimerInTasksList = (elem) => {
    const link = podioCreateTimerButton(
        'task',
        elem,
        '.task-title',
        elem.getAttribute('data-id'),
        'tasks-list-widget',
        'minimal'

    );

    if (!link) {
        return;
    }

    const injectContainer = $('.bd', elem);
    if (!injectContainer) {
        return;
    }

    injectContainer.insertAdjacentElement('beforeend', link);
}

// task view
tcbutton.render(
    '#task-permalink',
    {observe: true},
    elem => {
        const link = podioCreateTimerButton(
            'task',
            elem,
            '.task-header .task-title',
            location.pathname.split('/').pop(),
            'task-view',
            'normal'

        );

        if(!link) {
            return;
        }

        const injectContainer = $('.task-body.fields', elem);
        if (!injectContainer) {
            return;
        }

        let col = createTag('div', 'label');
        col.innerHTML = 'TimeCamp ';
        col.insertAdjacentElement('beforeend', createTag('span', 'icon-16 icon-16-black-wrench'));

        let value = createTag('div', 'value');
        value.insertAdjacentElement('afterbegin', link);

        let field = createTag('div', 'field')
        field.insertAdjacentElement('afterbegin', value);
        field.insertAdjacentElement('afterbegin', col);

        injectContainer.insertAdjacentElement('afterbegin', field);
    }
);

// app item view
tcbutton.render(
    'section.item-content',
    {observe: true},
    elem => {
        const link = podioCreateTimerButton(
            'item',
            elem,
            '#title .value',
            $('.share[data-id]').getAttribute('data-id'),
            'item-view',
            'normal'

        );

        if(!link) {
            return;
        }

        const injectContainer = $('.app-fields-list', elem);
        if (!injectContainer) {
            return;
        }

        let col = createTag('div', 'frame-label');
        col.innerHTML = 'TimeCamp ';
        col.insertAdjacentElement('beforeend', createTag('span', 'icon-16 icon-16-black-wrench'));

        let value = createTag('div', 'frame-content');
        value.insertAdjacentElement('afterbegin', link);

        let field = createTag('div', 'frame-wrapper')
        field.insertAdjacentElement('afterbegin', value);
        field.insertAdjacentElement('afterbegin', col);

        let item = createTag('li');
        item.insertAdjacentElement('afterbegin', field);

        injectContainer.insertAdjacentElement('afterbegin', item);
    }
);

// tasks in app item view
tcbutton.render(
    'section.item-content .task-list [data-id]',
    {observe: true},
    elem => {
        podioRenderTimerInTasksList(elem);
    }
);

// tasks in workspace view
tcbutton.render(
    '#wrapper.space.spaces .gridster .tasks-wrapper .gridster-widget.tasks .content [data-id]',
    {observe: true},
    elem => {
        podioRenderTimerInTasksList(elem);
    }
);

// items in app view
tcbutton.render(
    '#wrapper.space.apps .items-list [data-id]',
    {observe: true},
    elem => {
        const link = podioCreateTimerButton(
            'item',
            elem,
            '.app-badge-header',
            elem.getAttribute('data-id'),
            'items-list',
            'minimal'

        );

        if(!link) {
            return;
        }

        const injectContainer = $('footer .app-badge-footer-2', elem);
        if (!injectContainer) {
            return;
        }

        injectContainer.insertAdjacentElement('afterbegin', link);
    }
);