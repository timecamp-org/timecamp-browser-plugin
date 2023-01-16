"use strict";
import TimeFormatter, { DURATION_FORMATS } from "../TimeFormatter";
const ASANA = "asana";
const TASK_NOT_FOUND_INFO = "asana_task_not_found_in_backend_integration_info";

const buildExternalIdForAsana = (taskId) => {
  return ASANA + "_" + taskId;
};
const SELECTORS = {
  TOTAL_DURATION: "timecamp-total-duration",
  TASK_ROW: "SpreadsheetGridTaskNameAndDetailsCellGroup",
  TABLE_HEADING_ROW: "SpreadsheetHeaderColumn-heading",
  TASK_DURATION: "timecamp-task-duration",
};
const timeFormatter = new TimeFormatter();
let users = [];
let tasksDurations = {};

function calculateTotalDurationsByUser(timeEntries) {
  for (const { addons_external_id, user_id, duration } of timeEntries) {
    if (!tasksDurations[addons_external_id])
      tasksDurations[addons_external_id] = {};

    if (tasksDurations[addons_external_id][user_id])
      tasksDurations[addons_external_id][user_id] += parseInt(duration);
    else tasksDurations[addons_external_id][user_id] = parseInt(duration);
  }
}

function getTimeEntries() {
  return new Promise((resolve) => {
    if (users.length === 0) {
      resolve();
      return;
    }

    const userIds = users.map(({ user_id }) => user_id);
    chrome.runtime.sendMessage(
      { type: "getUsersTimeEntries", userIds },
      (response) => {
        calculateTotalDurationsByUser(response);
        resolve();
      }
    );
  });
}

function initializeUserList() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "getUsers" }, (response) => {
      users = response;
      resolve();
    });
  });
}
const onUserChanged = () => {
  let totalDuration = 0;
  document.querySelectorAll("." + SELECTORS.TASK_DURATION).forEach((row) => {
    const { duration } = row.dataset;
    totalDuration += duration * 1;
  });
  document.querySelector("." + SELECTORS.TOTAL_DURATION).innerText =
    timeFormatter.formatToDuration(
      totalDuration,
      DURATION_FORMATS.CLASSIC_WITH_SECONDS
    );
};

const getTaskDurationByUserId = ({ taskId, userId }) =>
  tasksDurations?.[taskId]?.[userId] ?? 0;

const initializeTCWidgets = () => {
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

  //List view
  tcbutton.render(
    ".SpreadsheetRow .SpreadsheetTaskName:not(.tc)",
    { observe: true },
    (elem) => {
      if ($(".timecamp", elem.parentNode)) {
        return false;
      }

      //child textaread id split
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
      document.querySelectorAll("." + SELECTORS.TASK_ROW).forEach((el) => {
        el.style.overflow = "unset";
      });

      if (!document.querySelector("." + SELECTORS.TOTAL_DURATION)) {
        const headingRow = document.querySelector(
          "." + SELECTORS.TABLE_HEADING_ROW
        );
        headingRow.style.justifyContent = "space-between";
        let span = tcbutton.createTotalDuration(SELECTORS.TOTAL_DURATION);
        headingRow.appendChild(span);
      }

      let div = document.createElement("div");
      div.className = "timecamp";
      elem.insertAdjacentElement("afterend", div);
      const usersWithTaskDuration = users
        .map((el) => {
          const label = !el.display_name ? el.email.split("@")[0] : el.display_name
          return {
            label,
            value: el.user_id,
            duration: getTaskDurationByUserId({
              taskId: externalTaskId,
              userId: el.user_id,
            }),
          };
        })
        
      if (usersWithTaskDuration.length > 0)
        tcbutton.renderPeoplePicker(div, usersWithTaskDuration, onUserChanged);
      elem.insertAdjacentElement("afterend", link);

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

initializeUserList()
  .then(() => {
    return getTimeEntries();
  })
  .then(() => {
    return initializeTCWidgets();
  });
