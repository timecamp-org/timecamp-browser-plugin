'use strict';

tcbutton.render(
    "div[role='listbox'] [role='option']:not(.tc)",
    { observe: true },
    function (elem) {
        const getDescription = function () {
            return elem
                .querySelector(
                    "div[role='listbox'] [role='option'] span[style*='user-select: text']"
                )
                .textContent.trim();
        };

        // Get project name if in project task view
        const getProject = function () {
            const p = $('.b-Mj.b-wd .b-f-n');
            if (!p) {
                return;
            }
            return p.textContent;
        };

        const task = elem
            .querySelector(
                "div[role='listbox'] [role='option'] span[style*='user-select: text']"
            );

        if (!task) {
            return false;
        }

        const link = tcbutton.createTimerLink({
            className: 'rememberthemilk',
            description: getDescription,
            projectName: getProject,
            buttonType: 'minimal'
        });

        task.parentElement.appendChild(link);

        return true;
    }
);
