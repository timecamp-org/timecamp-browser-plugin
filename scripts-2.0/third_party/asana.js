"use strict";
import browser from "webextension-polyfill";
import ReactDOM from 'react-dom';
import * as React from "react";
import TotalUsersTimeInTaskComponent from "../components/TotalUsersTimeInTaskComponent";

const ASANA = "asana";
const TASK_NOT_FOUND_INFO = "asana_task_not_found_in_backend_integration_info";

const buildExternalIdForAsana = (taskId) => {
    return ASANA + "_" + taskId;
};
const SELECTORS = {
    TOTAL_DURATION: "timecamp-total-duration",
    TASK_ROW: "SpreadsheetGridTaskNameAndDetailsCellGroup",
    TABLE_HEADING_ROW: "SpreadsheetHeaderColumn-heading",
};

function initializeUserList() {
    return new Promise((resolve, reject) => {
        browser.runtime
            .sendMessage({type: 'getUsers', cacheKey: 'users'})
            .then((users) => {
                let usersIds = users.map((el) => {
                    return el.user_id;
                });

                browser.runtime.sendMessage({
                    type: "getUsersTimeEntries",
                    userIds: usersIds,
                    cacheKey: ['usersTimeEntries', usersIds].join('_'),
                }).then(() => {
                    resolve(true);
                });
            })
    });
}

const initializeTCWidgets = (isLoggedIn) => {
    //Board view
    tcbutton.render(".BoardCardLayout:not(.tc)", { observe: true }, (elem) => {
        if ($(".tc-button", elem)) {
            return false;
        }

        const description = elem
            .querySelector(".BoardCard-taskName")
            .textContent.trim();
        const externalTaskId = buildExternalIdForAsana(elem.dataset.taskId);
        if (!externalTaskId) {
            return false;
        }

        const link = tcbutton.createTimerLink({
            className: ASANA,
            additionalClasses: [ASANA + "__board-view"],
            description: description,
            buttonType: "minimal",
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO,
        });

        const injectContainer = elem.querySelector(
            ".BoardCardLayout-actionButtons"
        );
        if (!injectContainer) {
            return false;
        }

        injectContainer.insertAdjacentElement("afterbegin", link);

        return true;
    });

    //List view helper
    tcbutton.render("." + SELECTORS.TASK_ROW + ":not(.tcAsanaTaskRowHelperClass)", { observe: true }, (elem) => {
        elem.classList.add('tcAsanaTaskRowHelperClass');
    });
    //List view
    tcbutton.render(
        ".SpreadsheetRow .SpreadsheetTaskName:not(.tc)",
        { observe: true },
        (elem) => {
            if ($(".timecamp", elem.parentNode)) {
                return false;
            }

            //child textarea id split
            const description = elem.querySelector("textarea").textContent.trim();
            const externalTaskId = buildExternalIdForAsana(
                $("textarea.SpreadsheetTaskName-input", elem).id.split("_").pop()
            );
            if (!externalTaskId) {
                return false;
            }

            const link = tcbutton.createTimerLink({
                className: ASANA,
                additionalClasses: [ASANA + "__list-view"],
                description: description,
                buttonType: "minimal",
                externalTaskId: externalTaskId,
                isBackendIntegration: true,
                taskNotFoundInfo: TASK_NOT_FOUND_INFO,
            });

            let containerForUserStats = document.createElement("div");
            containerForUserStats.className = "timecamp";
            elem.insertAdjacentElement("afterend", link);
            elem.insertAdjacentElement("afterend", containerForUserStats);
            if (isLoggedIn) {
                ReactDOM.render(
                    <TotalUsersTimeInTaskComponent externalTaskId={externalTaskId}/>,
                    containerForUserStats
                );
            }

            return true;
        }
    );

    //Task details
    tcbutton.render(".TaskPane:not(.tc)", { observe: true }, (elem) => {
        const description = $(
            ".TaskPane-titleRowInput textarea",
            elem
        ).textContent.trim();
        const externalTaskId = buildExternalIdForAsana(elem.dataset.taskId);
        if (!externalTaskId) {
            return false;
        }

        const link = tcbutton.createTimerLink({
            className: ASANA,
            additionalClasses: [ASANA + "__task-details"],
            description: description,
            externalTaskId: externalTaskId,
            isBackendIntegration: true,
            taskNotFoundInfo: TASK_NOT_FOUND_INFO,
        });

        const field = elem.querySelector(".TaskPaneToolbarAnimation");
        field.insertAdjacentElement("afterend", link);

        return true;
    });

    //Subtasks
    tcbutton.render(
        ".ItemRowTwoColumnStructure-left:not(.tc)",
        { observe: true },
        (elem) => {
            let description = $(
                ".simpleTextarea.AutogrowTextarea-input",
                elem
            ).textContent.trim();

            const externalTaskId = buildExternalIdForAsana(
                elem.parentNode.dataset.taskId
            );
            if (!externalTaskId) {
                return false;
            }

            const link = tcbutton.createTimerLink({
                className: ASANA,
                additionalClasses: [ASANA + "__subtasks"],
                description: description,
                buttonType: "minimal",
                externalTaskId: externalTaskId,
                isBackendIntegration: true,
                taskNotFoundInfo: TASK_NOT_FOUND_INFO,
            });

            elem.appendChild(link);

            return true;
        }
    );
};

tcbutton.isUserLogged().then((isUserLogged) => {
    if (isUserLogged) {
        initializeUserList().then(() => {
            return initializeTCWidgets(true);
        });
    } else {
        initializeTCWidgets(false);
    }
});