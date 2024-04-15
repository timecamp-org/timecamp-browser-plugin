"use strict";

// Task
tcbutton.render(
  ".conversationsPanelHeader.rowCommentsMode",
  { observe: true, debounceInterval: 500 },
  function (elem) {
    const task = $(".centeredTitle", elem);
    if (!task) {
      return;
    }

    const taskName = task.textContent;

    const alreadyCreatedButton = $(".tc-button", elem);
    if (alreadyCreatedButton) {
      if (taskName === alreadyCreatedButton.title) {
        return false;
      }
      alreadyCreatedButton.remove();
    }

    const link = tcbutton.createTimerLink({
      className: "smartsheet-task",
      buttonType: "minimal",
      description: taskName,
    });

    $(".centeredTitle", elem).appendChild(link);

    return true;
  }
);

// Sheet title
tcbutton.render(
  ".containerNameWrapper",
  { observe: true, debounceInterval: 500 },
  function (elem) {
    const project = $(".containerName.editable > .titleDiv", elem);
    const projectName = project.textContent.trim();

    const alreadyCreatedButton = $(".tc-button", elem);
    if (alreadyCreatedButton) {
      const title = `${projectName} - ${projectName}`;
      if (title === alreadyCreatedButton.title) {
        return false;
      }

      alreadyCreatedButton.remove();
    }

    const link = tcbutton.createTimerLink({
      className: "smartsheet",
      buttonType: "minimal",
      projectName: projectName,
      description: projectName,
    });

    elem.appendChild(link);

    return true;
  }
);
