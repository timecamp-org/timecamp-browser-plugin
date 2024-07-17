"use strict";

//Task
tcbutton.render(
    ".conversationsPanelHeader.rowCommentsMode:not(.tc)",
    { observe: true, debounceInterval: 500 },
    (elem) => {
        const task = $(".centeredTitle", elem);
        if (!task) {
            return false;
        }

        let title = task.textContent.trim();
        let colonIndex = title.indexOf(':');
        if (colonIndex !== -1) {
            title = title.substring(colonIndex + 1);
        }

        const link = tcbutton.createTimerLink({
            className: "smartsheet-task",
            buttonType: "minimal",
            description: title,
        });

        $(".centeredTitle", elem).appendChild(link);

        return true;
    }
);

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
    ".gridPrimaryCell:not(.tc)",
    { observe: true, debounceInterval: 500 },
    (elem) => {
        const title = $(".gridCellContent", elem)?.textContent.trim();
        if (!title) {
            return false;
        }

        const link = tcbutton.createTimerLink({
            className: "smartsheet-grid",
            buttonType: "minimal",
            projectName: title,
            description: title,
        });

        elem.insertAdjacentElement("beforebegin", link);

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
