'use strict';

const ODOO = 'odoo';
const ODOO_EXTERNAL_ID_PREFIX = 'odoo_task';

const buildExternalIdForOdoo = (taskId) => {
    if (!taskId) return null;
    return ODOO_EXTERNAL_ID_PREFIX + '_' + taskId;
};

const getTaskIdFromUrl = () => {
    const urlParts = window.location.pathname.split('/');
    
    // Handle pattern like /odoo/project/3/tasks/7
    const tasksIndex = urlParts.indexOf('tasks');
    if (tasksIndex !== -1 && tasksIndex < urlParts.length - 1) {
        const taskId = urlParts[tasksIndex + 1];
        // Make sure it's a valid numeric ID
        if (taskId && !isNaN(taskId)) {
            return taskId;
        }
    }
    
    // Fallback to original pattern like /id/7
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
    // Look for breadcrumb items with project links
    const $projectLinks = document.querySelectorAll('.o_breadcrumb .breadcrumb-item a[href*="/project/"]');
    
    if ($projectLinks.length > 0) {
        // Get the last project link (most specific)
        const lastProjectLink = $projectLinks[$projectLinks.length - 1];
        return lastProjectLink.textContent.trim();
    }
    
    return null;
};

tcbutton.render(
    '.o_statusbar_buttons:not(.tc)',
    { observe: true, debounceInterval: 300 },
    $container => {
        const taskId = getTaskIdFromUrl();
        const externalTaskId = buildExternalIdForOdoo(taskId);

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
            externalTaskId: externalTaskId,
            isBackendIntegration: !!externalTaskId,
            projectName: getProjectNameFromBreadcrumb()
        });

        $container.insertAdjacentElement('afterbegin', link);

        return true;
    }
);
