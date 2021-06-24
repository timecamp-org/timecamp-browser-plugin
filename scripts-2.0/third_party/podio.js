'use strict';
const PODIO = 'podio';
const TASK_NOT_FOUND_INFO = 'podio_task_not_found_in_backend_integration_info';

class PodioRenderer
{
    constructor(options) {
        this.settings = {
            type: '',
            container: null,
            titleSelector: '',
            podioId: '',
            additionalCSSClass: '',
            buttonType: 'normal',
            buttonOnHover: false,
            injectContainerSelector: ''
        }
        this.settings = Object.assign(this.settings, options);

        this.link = null;
        this.injectContainer = null;
    }

    buildExternalIdForPodio() {
        let prefix = '';
        switch (this.settings.type) {
            case 'app':
                prefix = 'a';
                break;

            case 'item':
                prefix = 'i';
                break;
        }

        return PODIO + '_' + prefix + this.settings.podioId;
    }

    podioCreateTimerButton() {
        if ($('.tc-button', this.settings.container)) {
            return false;
        }

        let titleElem = $(this.settings.titleSelector, this.settings.container);
        if (!titleElem) {
            return false;
        }

        const description = titleElem.innerText.trim();
        const externalTaskId = this.buildExternalIdForPodio();

        if (!externalTaskId) {
            return false;
        }

        let additionalClasses = [];
        if (this.settings.additionalCSSClass !== '') {
            additionalClasses.push(PODIO + '__' + this.settings.additionalCSSClass)
        }
        if (this.settings.buttonOnHover) {
            additionalClasses.push('tc-on-hover');
        }

        let buttonType = this.settings.buttonType;

        return tcbutton.createTimerLink({
            className: PODIO,
            additionalClasses: additionalClasses,
            description: description,
            buttonType,
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO
        });
    }

    render() {
        this.link = this.podioCreateTimerButton();

        if(!this.link) {
            return false;
        }

        if (this.settings.injectContainerSelector === '') {
            this.injectContainer = this.settings.container;
        } else {
            this.injectContainer = $(this.settings.injectContainerSelector, this.settings.container);
        }

        if (!this.injectContainer) {
            return false;
        }

        return true;
    }

    insert(elem, position) {
        if (!elem) {
            elem = this.link;
        }

        if (!position) {
            position = 'beforeend'
        }

        this.injectContainer.insertAdjacentElement(position, elem);

        return true;
    }

    renderAndInsert(elem, position) {
        let rendered = this.render();

        if (!rendered) {
            return false;
        }

        return this.insert(elem, position);
    }
}

const podioRenderTimerInTasksList = (elem) => {
    let renderer = new PodioRenderer({
        type: 'task',
        container: elem,
        titleSelector: '.task-title',
        podioId: elem.getAttribute('data-id'),
        additionalCSSClass: 'tasks-list-widget',
        buttonType: 'minimal',
        buttonOnHover: true,
        injectContainerSelector: '.bd'
    });

    return renderer.renderAndInsert();
}

// task view
tcbutton.render(
    '#task-permalink:not(.tc)',
    {observe: true},
    elem => {
        let renderer = new PodioRenderer({
            type: 'task',
            container: elem,
            titleSelector: '.task-header .task-title',
            podioId: location.pathname.split('/').pop(),
            additionalCSSClass: 'task-view',
            injectContainerSelector: '.task-body.fields'
        });

        let rendered = renderer.render();

        if (!rendered) {
            return false;
        }

        let col = createTag('div', 'label');
        col.innerHTML = 'TimeCamp ';
        col.insertAdjacentElement('beforeend', createTag('span', 'icon-16 icon-16-black-wrench'));

        let value = createTag('div', 'value');
        value.insertAdjacentElement('afterbegin', renderer.link);

        let field = createTag('div', 'field')
        field.insertAdjacentElement('afterbegin', value);
        field.insertAdjacentElement('afterbegin', col);

        return renderer.insert(field, 'afterbegin');
    }
);

// app item view
tcbutton.render(
    'section.item-content .app-fields-list:not(.tc)',
    {observe: true},
    elem => {
        let renderer = new PodioRenderer({
            type: 'item',
            container: elem,
            titleSelector: '#title .value',
            podioId: $('.share[data-id]').getAttribute('data-id'),
            additionalCSSClass: 'item-view',
        });

        let rendered = renderer.render();

        if (!rendered) {
            return false;
        }

        let col = createTag('div', 'frame-label');
        col.innerHTML = 'TimeCamp ';
        col.insertAdjacentElement('beforeend', createTag('span', 'icon-16 icon-16-black-wrench'));

        let value = createTag('div', 'frame-content');
        value.insertAdjacentElement('afterbegin', renderer.link);

        let field = createTag('div', 'frame-wrapper')
        field.insertAdjacentElement('afterbegin', value);
        field.insertAdjacentElement('afterbegin', col);

        let item = createTag('li');
        item.insertAdjacentElement('afterbegin', field);

        return renderer.insert(item,'afterbegin');
    }
);

// tasks in app item view
tcbutton.render(
    'section.item-content .task-list [data-id]:not(.tc)',
    {observe: true},
    elem => {
        return podioRenderTimerInTasksList(elem);
    }
);

// tasks in workspace view
tcbutton.render(
    '#wrapper.space.spaces .gridster .tasks-wrapper .gridster-widget.tasks .content [data-id]:not(.tc)',
    {observe: true},
    elem => {
        return podioRenderTimerInTasksList(elem);
    }
);

// items in app view badge
tcbutton.render(
    '#wrapper.space.apps .items-list [data-id]:not(.tc)',
    {observe: true},
    elem => {
        let renderer = new PodioRenderer({
            type: 'item',
            container: elem,
            titleSelector: '.app-badge-header',
            podioId: elem.getAttribute('data-id'),
            additionalCSSClass: 'items-list-badge',
            buttonType: 'minimal',
            buttonOnHover: true,
            injectContainerSelector: 'footer .app-badge-footer-2'
        });

        return renderer.renderAndInsert(null, 'afterbegin');
    }
);

// items in app view table
tcbutton.render(
    '.items-list .items-table table.data tr:not(.tc)',
    {observe: true},
    elem => {
        let index = $('.is-print', elem).innerText.trim();
        if (!index) {
            return false;
        }

        let podioId = $('.items-list .items-table table.count [data-index="'+index+'"]');
        if (!podioId) {
            return false;
        }

        let renderer = new PodioRenderer({
            type: 'item',
            container: elem,
            titleSelector: 'td[title]',
            podioId: podioId.getAttribute('data-id'),
            additionalCSSClass: 'items-list-table',
            buttonType: 'minimal',
            buttonOnHover: true,
            injectContainerSelector: 'td[title]'
        });

        return renderer.renderAndInsert();
    }
);

// items in app view card
tcbutton.render(
    '.items-list .items-card .card-item .card-component:not(.tc)',
    {observe: true},
    elem => {
        let renderer = new PodioRenderer({
            type: 'item',
            container: elem,
            titleSelector: 'header',
            podioId: elem.getAttribute('data-id'),
            additionalCSSClass: 'item-card-view',
            buttonType: 'minimal',
            buttonOnHover: true,
        });

        return renderer.renderAndInsert();
    }
);

// items in app view activity and tasks in workspace
tcbutton.render(
    '#stream [data-ref-type]:not(.tc)',
    {observe: true},
    elem => {
        let e = $('.like', elem);

        let renderer = new PodioRenderer({
            type: e.getAttribute('data-ref_type'),
            container: elem,
            titleSelector: '.title',
            podioId: e.getAttribute('data-ref_id'),
            additionalCSSClass: 'stream-list-activity',
            buttonType: 'minimal',
            buttonOnHover: true,
            injectContainerSelector: '.body .bd'
        });

       return renderer.renderAndInsert();
    }
);

// my tasks
tcbutton.render(
    '.task-group-list [data-single-view]:not(.tc)',
    {observe: true},
    elem => {
        let renderer = new PodioRenderer({
            type: 'task',
            container: elem,
            titleSelector: '.single-task .task-summary .task-link',
            podioId: elem.getAttribute('data-task-id'),
            additionalCSSClass: 'tasks-list-expanded',
            injectContainerSelector: '.task-detail .task-right-column'
        });

        let rendered = renderer.render();

        if (!rendered) {
            return false;
        }

        let container = createTag('div', 'task-via');
        container.insertAdjacentElement('afterbegin', renderer.link);

        return renderer.insert(container);
    }
);
