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

const podioRenderTimerInTasksList = (elem) => {
    if ($('.tc-button', elem)) {
        return;
    }

    if (!elem.querySelector('.task-title')) {
        return;
    }

    const description = elem.querySelector('.task-title').innerText.trim();
    const externalTaskId = buildExternalIdForPodio(
        'task',
        elem.getAttribute('data-id')
    );

    if (!externalTaskId) {
        return;
    }

    const link = tcbutton.createTimerLink({
        className: PODIO,
        additionalClasses: [PODIO + '__tasks-list-widget'],
        description: description,
        buttonType: 'minimal',
        externalTaskId: externalTaskId,
        taskNotFoundInfo: TASK_NOT_FOUND_INFO
    });

    const injectContainer = elem.querySelector('.bd');
    if (!injectContainer) {
        return;
    }

    injectContainer.insertAdjacentElement('beforeend', link);
}

// task view
tcbutton.render(
    '#task-permalink',
    {observe: true, debounceInterval: 3000},
    elem => {
        if ($('.tc-button', elem)) {
            return;
        }

        if (!elem.querySelector('.task-header .task-title')) {
            return;
        }

        const description = elem.querySelector('.task-header .task-title').innerText.trim();
        const externalTaskId = buildExternalIdForPodio(
            'task',
            location.pathname.split('/').pop()
        );

        if (!externalTaskId) {
            return;
        }

        const link = tcbutton.createTimerLink({
            className: PODIO,
            additionalClasses: [PODIO + '__task-view'],
            description: description,
            externalTaskId: externalTaskId,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        const injectContainer = elem.querySelector('.task-body.fields');
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
    {observe: true,},
    elem => {
        if ($('.tc-button', elem)) {
            return;
        }

        if (!elem.querySelector('#title')) {
            return;
        }

        const description = elem.querySelector('#title .value').innerText.trim();
        const externalTaskId = buildExternalIdForPodio(
            'item',
            document.querySelector('.share[data-id]').getAttribute('data-id')
        );

        if (!externalTaskId) {
            return;
        }

        const link = tcbutton.createTimerLink({
            className: PODIO,
            additionalClasses: [PODIO + '__item-view'],
            description: description,
            externalTaskId: externalTaskId,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });

        const injectContainer = elem.querySelector('.app-fields-list');
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
    {observe: true,},
    elem => {
        podioRenderTimerInTasksList(elem);
    }
);

// tasks in workspace view
tcbutton.render(
    '#wrapper.space .gridster .tasks-wrapper .gridster-widget.tasks .content [data-id]',
    {observe: true,},
    elem => {
        podioRenderTimerInTasksList(elem);
    }
);