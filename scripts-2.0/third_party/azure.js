tcbutton.render('.work-item-form-headerContent:not(.tc,.flex-row)', {observe: true}, function (elem) {
    if ($('.tc-button', elem)) {
        return false;
    }
    var link, itemId, description, project, tagNames;
    itemId = () => $('.work-item-form-id > span', elem).textContent;
    description = () => $('.work-item-form-title input', elem).value;
    project = $("input[aria-label='TimeCamp Project']") ? $("input[aria-label='TimeCamp Project']").value : $(".navigation-container .project-item .text-ellipsis").textContent;
    tagNames = () => Array.from($$(".tags-items-container .tag-item:not(.tags-add-button) .tag-box")).map(e => e.innerText);
    link = tcbutton.createTimerLink({
        description: () => "#" + itemId() + " " + description(),
        projectName: project,
        taskName: () => description(),
    });
    link.style.display = "block";
    link.style.paddingTop = "0";
    link.style.paddingBottom = "0";
    link.style.marginBottom = "10px";
    link.style.cursor = 'pointer';
    link.style.width = 'fit-content';
    elem.appendChild(link);
  });
  
  tcbutton.render('.work-item-form-header:not(.tc,.flex-row)', {observe: true}, function (elem) {
    if ($('.tc-button', elem)) {
        return false;
    }
    var link, itemId, description, project;
    itemId = () => $('.work-item-form-header > .body-xl', elem).textContent;
    description = () => $('.work-item-title-textfield input', elem).value;
    project = $("input[aria-label='TimeCamp Project']") ? $("input[aria-label='TimeCamp Project']").value : $(".navigation-container .project-item .text-ellipsis").textContent;
    link = tcbutton.createTimerLink({
        description: () => "#" + itemId() + " " + description(),
        projectName: project,
        taskName: () => description()
    });
    link.style.display = "block";
    link.style.paddingTop = "0";
    link.style.paddingBottom = "0";
    link.style.marginBottom = "10px";
    link.style.cursor = 'pointer';
    link.style.width = 'fit-content';
    
    elem.appendChild(link);
  });
  