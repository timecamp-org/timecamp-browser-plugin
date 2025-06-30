'use strict';

const ODOO = 'odoo';

const getTaskIdFromUrl = () => {
    const urlParts = window.location.pathname.split('/');
    
    const tasksIndex = urlParts.indexOf('tasks');
    if (tasksIndex !== -1 && tasksIndex < urlParts.length - 1) {
        const taskId = urlParts[tasksIndex + 1];
        if (taskId && !isNaN(taskId)) {
            return taskId;
        }
    }
    
    const idIndex = urlParts.indexOf('id');
    if (idIndex !== -1 && idIndex < urlParts.length - 1) {
        const taskId = urlParts[idIndex + 1];
        if (taskId && !isNaN(taskId)) {
            return taskId;
        }
    }
    
    return null;
};

const getProjectNameFromBreadcrumb = () => {
    const $projectLinks = document.querySelectorAll('.o_breadcrumb .breadcrumb-item a[href*="/project/"]');
    
    if ($projectLinks.length > 0) {
        const lastProjectLink = $projectLinks[$projectLinks.length - 1];
        return lastProjectLink.textContent.trim();
    }
    
    return null;
};

tcbutton.render(
    '.o_statusbar_buttons:not(.tc)',
    { observe: true, debounceInterval: 300 },
    elem => {
        const taskId = getTaskIdFromUrl();

        const descriptionSelector = () => {
            const $breadcrumb = $('.o_last_breadcrumb_item span');
            if ($breadcrumb && $breadcrumb.textContent) {
                return $breadcrumb.textContent.trim();
            }
            
            const $title = $('.o_form_view .o_field_char input[name="name"]');
            if ($title && $title.value) {
                return $title.value.trim();
            }
            
            return 'Odoo Task';
        };

        const link = tcbutton.createTimerLink({
            className: ODOO,
            description: descriptionSelector,
            projectName: getProjectNameFromBreadcrumb()
        });

        elem.insertAdjacentElement('afterbegin', link);

        return true;
    }
);
