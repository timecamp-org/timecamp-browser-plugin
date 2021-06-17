'use strict';

tcbutton.render(
    '.o_control_panel .breadcrumb:not(.tc)',
    { observe: true },

    $container => {
        const descriptionSelector = () => {
            const $description = $('.breadcrumb-item.active', $container);
            return $description.textContent.trim();
        };

        const link = tcbutton.createTimerLink({
            className: 'odoo',
            description: descriptionSelector
        });

        $container.appendChild(link);

        return true;
    }
);
