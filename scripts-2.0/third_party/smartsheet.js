"use strict";

//Sheet title
tcbutton.render(
    ".containerNameWrapper:not(.tc)",
    { observe: true, debounceInterval: 500 },
    (elem) => {
        const project = $(".containerName.editable > .titleDiv", elem);
        const projectName = project.textContent.trim();

        const link = tcbutton.createTimerLink({
            className: "smartsheet",
            buttonType: "minimal",
            projectName: projectName,
            description: projectName,
        });

        $('.refreshIcon', elem).insertAdjacentElement("beforebegin", link);

        return true;
    }
);

//Grid cell and gantt cell
tcbutton.render(
    ".gridRowWrapper > div:not(.groupingSummaryReportGroup) .gridPrimaryCell .gridCellContent",
    { observe: true, debounceInterval: 500 },
    (elem) => {
        if ($(".tc-button.smartsheet-grid", elem)) {
            return false;
        }

        const title = elem?.textContent.trim();

        if (!title) {
            return false;
        }

        const link = tcbutton.createTimerLink({
            className: "smartsheet-grid",
            buttonType: "minimal",
            projectName: title,
            description: title,
        });

        elem.insertAdjacentElement("afterbegin", link);

        return true;
    }
);

//Card view
tcbutton.render(
    ".clscvC .clscvTitle:not(.tc)",
    { observe: true, debounceInterval: 500 },
    (elem) => {
        const title = elem?.textContent.trim();
        if (!title) {
            return false;
        }

        const link = tcbutton.createTimerLink({
            className: "smartsheet-card",
            buttonType: "minimal",
            projectName: title,
            description: title,
        });

        elem.insertAdjacentElement("afterbegin", link);

        return true;
    }
);

//Board card details view
tcbutton.render(
    ".card-focus-lock:not(.tc)",
    { observe: true, debounceInterval: 500 },
    (elem) => {
        const titleField = $('[data-client-id="boardvw-inline-edit-text-field"]', elem);
        const titleInput = $('.inline-edit-text-field-input', titleField);
        const titleWrapper = titleField?.parentElement;

        if (!titleField || !titleInput || !titleWrapper) {
            return false;
        }

        if ($('.tc-button.smartsheet-board-card', titleWrapper)) {
            return false;
        }

        const title = titleInput.value?.trim();

        if (!title) {
            return false;
        }

        titleWrapper.classList.add('tc-smartsheet-board-card-title');

        const link = tcbutton.createTimerLink({
            className: "smartsheet-board-card",
            buttonType: "minimal",
            projectName: title,
            description: title,
        });

        titleWrapper.insertAdjacentElement("afterbegin", link);

        return true;
    }
);
