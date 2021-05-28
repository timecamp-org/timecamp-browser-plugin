import * as React from "react";
import { Task } from "./index";

export interface TaskPickerHook {
    toggleTask: (taskId: number) => void;
    selectedTask: Task;
}

export const useTaskPickerHook = () => {
    const emptyTask = {id: 0, parentId: 0, name: "", children: [], path: [], billable: false};

    const [taskList, setTaskList] = React.useState<Task[]>([]);
    const [fullTaskTree, setFullTaskTree] = React.useState<Task[]>([]);
    const [recentlyUsedTaskList, setRecentlyUsedTaskList] = React.useState<Task[]>([]);
    const [hideTreeList, setHideTreeList] = React.useState<number[]>([]);
    const [selectedTask, setSelectedTask] = React.useState<Task>(emptyTask);

    const [taskPermissionsMap, setTaskPermissionsMap] = React.useState({});

    const [searchText, setSearchText] = React.useState<string>("");

    const selectTask = (task: Task): void => {
        selectedTask["id"] = task.id;
        selectedTask["name"] = task.name;
        selectedTask["parentId"] = task.parentId;
        selectedTask["path"] = task.path;

        setSelectedTask(selectedTask);
    };

    return {
        selectTask,
        setSearchText,
        searchText,
        selectedTask,
        setSelectedTask,
        taskList,
        setTaskList,
        fullTaskTree,
        setFullTaskTree,
        recentlyUsedTaskList,
        setRecentlyUsedTaskList,
        hideTreeList,
        setHideTreeList,
        taskPermissionsMap,
        setTaskPermissionsMap,
        emptyTask
    };
};
