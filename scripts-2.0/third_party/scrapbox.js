'use strict';

tcbutton.render(
    '.telomere-border .description:not(.tc)',
    { observe: true },
    $container => {
        const descriptionSelector = () => {
            const $description = $container.closest('.line').querySelector('.text');
            return $description.textContent.trim();
        };

        const link = tcbutton.createTimerLink({
            className: 'scrapbox',
            description: descriptionSelector
        });

        $container.appendChild(link);
    }
);
