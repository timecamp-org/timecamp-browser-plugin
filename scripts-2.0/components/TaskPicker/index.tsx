import * as React from "react";
import Dropdown from "../Dropdown";
import SearchInput from "../SearchInput";
import { useTaskPickerHook } from "./hook";
import { useDropdownHook } from "../Dropdown/hook";
import "./styles.scss";
import Icon from "../Icon";
import { IconName } from "../../icons/types";
import { FixedSizeTree as Tree } from "react-vtree";
import translate from "../../Translator";
const browser = require('webextension-polyfill');
const loaderGifUrl = browser.runtime.getURL('images/loader.gif');
import decodeHtmlEntities from "../../helpers/HtmlEntities";

export interface Task {
  id: number;
  name: string;
  parentId: number;
  children: Task[];
  path?: string[];
  billable: boolean;
  externalTaskId: string|null;
}

export interface TaskPicker {
    browser: any;
    onTaskClick(taskId: Task): any,
    userId: number,
    clearTrigger: boolean,
    presetTaskByTaskId: number|null,
    presetTaskByExternalId: string|null,
    onNotFoundTaskForActiveBackendIntegration(): any,
    onAutoDetectTaskForActiveBackendIntegration(): any,
}

const TaskPicker: React.FC<TaskPicker> = (props) => {
  const MIN_SEARCH_TEXT_LENGTH = 2;

  const CAN_TRACK_TIME_PERMISSION_ID = 3;
  const TASK_MIN_ACCESS_LEVEL = 2;

  const taskPickerHook = useTaskPickerHook();
  const dropdownHook = useDropdownHook();
  const [isSearching, setIsSearching] = React.useState<boolean>(false);

  function* treeWalker(refresh) {
    const stack = [] as any;

    let tasks = taskPickerHook.taskList;

    for (var taskId in tasks) {
      stack.push({
        nestingLevel: 0,
        node: tasks[taskId],
      });
      while (stack.length !== 0) {
        let task = stack.pop();
        const {
          node: { children = [], id, name },
          nestingLevel,
        } = task;

        //something is wrong with shallow update, we have to force update full each time
        refresh = true;

        const isOpened = yield refresh
          ? {
              id,
              isLeaf: children.length === 0,
              isOpenByDefault: false,
              name,
              nestingLevel,
              task,
            }
          : id;

        if (children.length !== 0 && (isOpened || taskPickerHook.searchText.length >= MIN_SEARCH_TEXT_LENGTH)) {
          for (let i = children.length - 1; i >= 0; i--) {
            stack.push({
              nestingLevel: nestingLevel + 1,
              node: children[i],
            });
          }
        }
      }
    }
  }

  const Node = ({
    data: { isLeaf, name, nestingLevel, task },
    isOpen,
    style,
    toggle,
  }) => {
    const canTrackTime = Array.isArray(taskPickerHook.taskPermissionsMap[task.node.id])
        || taskPickerHook.taskPermissionsMap[task.node.id][CAN_TRACK_TIME_PERMISSION_ID] >= TASK_MIN_ACCESS_LEVEL;

    return <React.Fragment>
        <div
      style={{
        ...style,
        left: nestingLevel * 20 + "px",
        width: "calc(100% - " + 20 * nestingLevel + "px)",
      }}
      className={"TaskPicker__tree_row"}
    >
      {
        <div
          className={"TaskPicker__tree_" + (isOpen ? "expanded" : "collapsed")}
          onClick={toggle}
        >
          {!isLeaf && (<div className="TaskPicker__icon_box TaskPicker__icon_box__clickable"

          >
            <Icon
              className={
                "TaskPicker__icon " + isOpen ? "TaskPicker__icon--open" : ""
              }
              name={isOpen ? IconName.CHEVRON_DOWN : IconName.CHEVRON_RIGHT}

            />
          </div>)}

          {isLeaf && (<div className="TaskPicker__icon_box"
          >
          </div>)}
        </div>
      }
      <a title={canTrackTime ? "" : translate('time_traking_to_' + (nestingLevel === 0 ? 'project' : 'task') +'_not_allowed')}
        className={"TaskPicker__TaskRow" + (canTrackTime ? "" : " TaskPicker__TaskRow__disabled")}
        onClick={() => {
          canTrackTime && onTaskClick(task.node);
        }}
      >
            {name}
      </a>
        </div>
    </React.Fragment>
  };

  const onSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    taskPickerHook.setSearchText(event.target.value);

    if (taskPickerHook.searchText.length <= MIN_SEARCH_TEXT_LENGTH) {
      setIsSearching(false);
    }
  };

  const renderTaskPickerContent = () => {
    return (
      <React.Fragment>
        <div className="TaskPicker__content">
          <div className="TaskPicker__content_box">
            <SearchInput
              debounce={500}
              placeholder={"Search"}
              onChange={onSearchInputChange}
            />
          </div>
          <div id="taskpicker" className="TaskPicker__list">
            <ul className={"TaskPicker__TcUiClearedUl"}>
              {taskPickerHook.searchText.length < MIN_SEARCH_TEXT_LENGTH && taskPickerHook.recentlyUsedTaskList.length > 0 && (
                <div className="TaskPicker__content_box">
                  <div className="TaskPicker__label">
                    {translate("recently_used")}
                  </div>
                  {taskPickerHook.recentlyUsedTaskList.map((task) =>
                    renderRecentlyUsed(task)
                  )}
                </div>
              )}
              {isSearching && (
                  <div className="TaskPicker__content_box">
                    <div className="TaskPicker__label">
                      {translate("projects_and_tasks")}
                    </div>
                    <div className="TaskPicker__loader_wrapper">
                      <img alt='loader' className="TaskPicker__loader" src={loaderGifUrl} />
                    </div>
                  </div>
              )}
              {!isSearching && (
                  <div className="TaskPicker__content_box">
                    <div className="TaskPicker__label">
                      {translate("projects_and_tasks")}
                    </div>
                    <Tree
                        treeWalker={treeWalker}
                        itemSize={32}
                        height={window.innerHeight / 4}
                        width={"100%"}
                    >
                      {Node}
                    </Tree>
                  </div>
              )}
            </ul>
          </div>
        </div>
      </React.Fragment>
    );
  };

  const onTaskClick = (task: Task) => {
    taskPickerHook.selectTask(task);
    dropdownHook.onBackdropClick(event);

    setIsSearching(false);
    props.onTaskClick(task)
    taskPickerHook.setSearchText("");
  };

  const onBackdropClick = (e) => {
    dropdownHook.onBackdropClick(e);
    setIsSearching(false);
    taskPickerHook.setSearchText("");
  };

  const renderRecentlyUsed = (task: Task) => {
    return (
      <li>
        <a
          key={task.id}
          className="TaskPicker__TaskRow"
          onClick={() => {
            onTaskClick(task);
          }}
        >
          {task.name}
        </a>
      </li>
    );
  };

  const taskListToTaskTree = (list) => {
    let map = {},
      node: Task,
      roots: Task[] = [],
      i: number;

    let orphans = {};

    for (i = 0; i < list.length; i += 1) {
      map[list[i].id] = i; //initialize the map
      list[i].children = []; //initialize the children

      node = list[i];

      if(Array.isArray(orphans[node.id])) {
          for (var k = 0; k < orphans[node.id].length; k++) {
              list[i].children.push(list[map[orphans[node.id][k]]]);
          }
          delete orphans[node.id];
      }

      if (node.parentId === null || node.parentId === 0) {
          //@ts-ignore
          roots.push(node);
      }  else if (map[node.parentId] !== undefined) {
          list[map[node.parentId]].children.push(node);
      } else if (Array.isArray(orphans[node.parentId])) {
          orphans[node.parentId].push(node.id);
      } else {
          orphans[node.parentId] = [node.id];
      }
    }
    for (var x = 0; x < roots.length; x++) {
      roots[x].path = [];
      fillPath(roots[x]);
    }

    return roots;
  };

  const fillPath = (node: Task): Task => {
    let path = node.path?.map((x) => x);
    path?.push(node.name);
    for (var i = 0; i < node.children.length; i++) {
      node.children[i].path = path;
      fillPath(node.children[i]);
    }

    return node;
  };

  const fetchFullTaskTree = () => {
      return new Promise((resolve) => {
          props.browser.runtime
              .sendMessage({
                  type: "getFullTaskTree",
              })
              .then(function (data: any) {
                  let permsMap = {};
                  let taskListWithExternalTaskId = {};

                  let taskList = Object.values(data).map((task: any) => {
                      permsMap[task.task_id] = task.perms;

                      let t = {
                          id: task.task_id,
                          name: decodeHtmlEntities(task.name),
                          parentId: task.parent_id,
                          billable: !!task.billable,
                          externalTaskId: task.external_task_id,
                      } as Task;

                      if (task.external_task_id) {
                          taskListWithExternalTaskId[task.external_task_id] = t;
                      }

                      return t;
                  });

                  taskPickerHook.setTaskPermissionsMap(permsMap);

                  const taskTree = taskListToTaskTree(taskList);

                  taskPickerHook.setTaskListWithExternalTaskId(taskListWithExternalTaskId);
                  taskPickerHook.setTaskList(taskTree);
                  taskPickerHook.setFullTaskTree(taskTree);

                  findAndPresetTask(taskListWithExternalTaskId, taskTree);

                  resolve(null);
              });
      });
  };

  const fetchAndPrepareRecentlyUsedTasks = (): void => {
    props.browser.runtime
      .sendMessage({
        type: "getRecentlyUsed",
      })
      .then(function (data: any) {
        taskPickerHook.setRecentlyUsedTaskList(
          Object.values(data).map((task: any) => {
            task.name = decodeHtmlEntities(task.name);
            try {
              Object.values(task["ancestors"])
                .reverse()
                .forEach((ancestorTask: any) => {
                  if (task.name.length > 40) {
                    task.name = task.name.substring(0, 37) + " ...";
                  }

                  if (ancestorTask.name.length > 20) {
                    ancestorTask.name =
                      ancestorTask.name.substring(0, 17) + " ...";
                  }

                  task.name += " - " + decodeHtmlEntities(ancestorTask.name);

                  throw {}; //so we take only 1 parent
                });
            } catch (exception) {
              if (exception.length < 1) throw exception;
            }

            return {
              id: task.task_id,
              name: task.name,
              parentId: task.parent_id,
              billable: !!task.billable,
              externalTaskId: task.external_task_id,
            } as Task;
          })
        );
      });
  };

  const fetchFilteredTasksBySearch = (): void => {
    setIsSearching(true);
    setVisibleTaskBySearchText(JSON.parse(JSON.stringify(taskPickerHook.fullTaskTree)));
    setIsSearching(false);
  };

  const setVisibleTaskBySearchText = (tasks: Task[]) => {
      taskPickerHook.setTaskList(searchChildrenForSearchText(tasks));
  };

    const searchChildrenForSearchText = (tasks) => {
        let filteredTasks: Task[] = [];

        for (const task of tasks) {
            if (task.children && task.children.length > 0) {
                let children = searchChildrenForSearchText(task.children);
                task.children = children;

                if(children.length === 0 && task.name.normalizeForSearch().indexOf(taskPickerHook.searchText.normalizeForSearch()) === -1) {
                    continue;
                }
                filteredTasks.push(task);
            } else if (task.name.normalizeForSearch().indexOf(taskPickerHook.searchText.normalizeForSearch()) !== -1) {
                filteredTasks.push(task);
            }
        }

        return filteredTasks;
    };

  const renderSelectedTask = () => {
    let task = taskPickerHook.selectedTask;
    return task.name != "" ? (
      <React.Fragment>
        <span className="TaskPicker__SelectedTask__label">{task.name}</span>
        <div className="TaskPicker__SelectedTask__path">
          {task.path?.join(" / ")}
        </div>
      </React.Fragment>
    ) : (
      translate("select_task")
    );
  };

    const pickTask = (task) => {
        taskPickerHook.selectTask(task);
        props.onTaskClick(task)
        props.onAutoDetectTaskForActiveBackendIntegration();
    }

    const findAndPresetTask = (taskListWithExternalTaskId, fullTaskTree) => {
        //try to set task by taskId (used only for Google Calendar)
        if (props.presetTaskByTaskId !== null) {
            for (const task of fullTaskTree) {
                if (task.id == props.presetTaskByTaskId) {
                    pickTask(task);

                    return;
                }
            }
        }

        //try to set task by externalTaskId (used for all backend integrations)
        if (props.presetTaskByExternalId !== null) {
            if (props.presetTaskByExternalId in taskListWithExternalTaskId) {
                let task = taskListWithExternalTaskId[props.presetTaskByExternalId];
                pickTask(task);

                return;
            }
            props.onNotFoundTaskForActiveBackendIntegration();
        }
    }

  React.useEffect(() => {
      if(props.userId !== 0) {
          if(taskPickerHook.taskList.length === 0) {
              fetchAndPrepareRecentlyUsedTasks();
              fetchFullTaskTree();
          } else {
              findAndPresetTask(taskPickerHook.taskListWithExternalTaskId, taskPickerHook.fullTaskTree);
          }
      }
  }, [props.userId, props.presetTaskByExternalId, props.presetTaskByTaskId]);

  React.useEffect(() => {
      taskPickerHook.selectTask(taskPickerHook.emptyTask);
  }, [props.clearTrigger]);

  React.useEffect(() => {
    if (taskPickerHook.searchText.length >= MIN_SEARCH_TEXT_LENGTH) {
      fetchFilteredTasksBySearch();
    } else {
      taskPickerHook.setTaskList(taskPickerHook.fullTaskTree);
    }
  }, [taskPickerHook.searchText]);

  return (
    <div className="TaskPicker">
      <div className="TaskPicker__title">Task</div>
      <Dropdown
        isOpen={dropdownHook.isOpen}
        additionalClass={["TaskPicker__dropdown"]}
        children={renderTaskPickerContent()}
        text={renderSelectedTask()}
        onDropdownButtonClick={dropdownHook.onDropdownButtonClick}
        onBackdropClick={onBackdropClick}
        isDisabled={props.userId === 0 && taskPickerHook.taskList.length === 0}
      />
    </div>
  );
};

export default TaskPicker;
