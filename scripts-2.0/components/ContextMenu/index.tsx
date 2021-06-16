import * as React from "react";
import Header from "../Header";
import Note from "../Note";
import Billable from "../Billable";
import Footer from "../Footer";
import {useEffect, useState, useRef, useMemo} from "react";
const browser = require('webextension-polyfill');
import './styles.scss';
import TagPicker from "../TagPicker";
import TaskPicker from "../TaskPicker";
import BackendIntegrationAdMessage from "../BackendIntegrationAdMessage";
import GroupSetting from "../../GroupSetting";

export interface ContextMenuInterface {
    service: string | React.ReactNode;
    position: object,
    note: string,
    billable: boolean,
    startTimerCallback: Function,
    billableInputVisibility: boolean,
    externalTaskId: string,
    isBackendIntegration: boolean,
    taskNotFoundInBackendIntegrationInfo: string,
}

const ContextMenu: React.FC<ContextMenuInterface> = (props) => {
    const node = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(true);
    const [service, setService] = useState(props.service);
    const [note, setNote] = useState(props.note);
    const [billable, setBillable] = useState(props.billable);
    const [billableInputVisibility, setBillableInputVisibility] = useState<boolean>(props.billableInputVisibility);
    const [taskId, setTaskId] = useState(0);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [isSelectedTagsValid, setIsSelectedTagsValid] = useState<boolean>(true);
    const [canCreateTags, setCanCreateTags] = useState<boolean>(false);
    const [isTagModuleEnabled, setIsTagModuleEnabled] = useState<boolean>(true);
    const startTimerCallback = props.startTimerCallback;
    const [userId, setUserId] = useState<number>(0);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [clearTrigger, setClearTrigger] = useState<boolean>(false);
    const [externalTaskId, setExternalTaskId] = useState(props.externalTaskId);
    const [isBackendIntegration, setIsBackendIntegration] = useState(props.isBackendIntegration);
    const [noTaskFoundDisplayAlert, setNoTaskFoundDisplayAlert] = useState<boolean>(false);
    const [taskNotFoundInBackendIntegrationInfo, setTaskNotFoundInBackendIntegrationInfo]
        = useState<string>(props.taskNotFoundInBackendIntegrationInfo);
    const [showBackendIntegrationAdMessage, setShowBackendIntegrationAdMessage] = useState<boolean>(false);

    const THIRTY_DAYS_IN_MILISEC = 2592000000;


    useEffect(() => {
        setNote(props.note);
        setBillable(props.billable);
        setBillableInputVisibility(props.billableInputVisibility);
        setService(props.service);
        setExternalTaskId(props.externalTaskId);
        setIsBackendIntegrationAndUserHasIntegration(props.isBackendIntegration);
        setTaskNotFoundInBackendIntegrationInfo(props.taskNotFoundInBackendIntegrationInfo);
        setOpen(true);
        document.addEventListener("click", onClickOutside);

        return () => {
            document.removeEventListener("click", onClickOutside);
        };
    }, [props]);


    useMemo(() => {
        browser.runtime.sendMessage({
            type: 'isTagModuleEnabled',
        }).then((value) => {
            setIsTagModuleEnabled(!!value);
        }).catch(() => {
        });

        browser.runtime.sendMessage({
            type: "getUserData"
        }).then((data) => {
            setCanCreateTags(data.permissions.can_change_group_settings);
            setUserId(parseInt(data.user_id));
            setIsAdmin(data.permissions.role_administrator);
            getBackendIntegrationAdData(data.user_id);

        });

        if (billableInputVisibility === null) {
            setBillableInputVisibility(true);
            browser.runtime.sendMessage({
                type: 'getBillableInputVisibilityFromStorage',
            }).then((value) => {
                setBillableInputVisibility(value);
            }).catch(() => {
            });
        }
    }, []);

    const getBackendIntegrationAdData = (userId: number) => {
        browser.runtime.sendMessage({
            type: 'getUserSetting',
            name: GroupSetting.DONT_SHOW_BE_INTEGRATION_AD,
            userId: userId,
            timestamp: true
        }).then((resolve) => {
            if(resolve.modify_time === false || (new Date().getTime() - new Date(resolve.modify_time).getTime()) > THIRTY_DAYS_IN_MILISEC) {
                setShowBackendIntegrationAdMessage(true);
                return;
            }

            if(parseInt(resolve.value) === 1) {
                setShowBackendIntegrationAdMessage(false);
                return;
            }

            if(resolve.value === "" || parseInt(resolve.value) === 0) {
                setShowBackendIntegrationAdMessage(true);
                return;
            }

        }).catch(() => {
            setShowBackendIntegrationAdMessage(false);
        });
    };

    const setIsBackendIntegrationAndUserHasIntegration = (isBackendIntegration) => {
        if (isBackendIntegration === false) {
            setIsBackendIntegration(false);
        } else {
            browser.runtime.sendMessage({
                type: 'hasBackendIntegrationEnabled',
                integration: service,
            }).then((isBackendActiveIntegration) => {
                setIsBackendIntegration(isBackendActiveIntegration);
            });
        }
    }

    const onClickOutside = e => {
        const shouldStayOpen = node.current !== null && node.current.contains(e.target);

        if (!shouldStayOpen) {
            clearAndClose();
        }
    };

    const onClickSave = (e) => {
        e.stopPropagation();

        startTimerCallback(
            taskId,
            note,
            service,
            externalTaskId
        ).then((response) => {
            //todo change backend to do startTimer and editEntry in one request
            browser.runtime.sendMessage({
                type: 'editEntry',
                entryId: response.entry_id,
                billable: billable,
                note: note,
                taskId: taskId,
                service: service
            }).then(() => {
            }).catch(() => {
            });

            if(selectedTags.length) {
                browser.runtime.sendMessage({
                    type: "assignTagsToEntry",
                    entryId: response.entry_id,
                    tags: selectedTags
                }).then(() => {
                })
            }
        });

        clearAndClose();
    };

    const onClickCancel = (e) => {
        e.stopPropagation();
        clearAndClose();
    };

    const clearAndClose = () => {
        setClearTrigger(!clearTrigger);
        setOpen(false);
        setTaskId(0);
    };

    const renderTagPicker = () => {
        return <React.Fragment>
            <div className="TagPicker">
                <div className="TagPicker__title">Tag</div>
                <TagPicker
                    taskId={taskId}
                    handleTagsValidity={setIsSelectedTagsValid}
                    handleSelectedTagsChange={setSelectedTags}
                    browser={browser}
                    canCreateTags={canCreateTags}
                />
            </div>
        </React.Fragment>;
    };

    const onNotFoundTaskForActiveBackendIntegration = () => {
        setNoTaskFoundDisplayAlert(true);
        setTaskId(0);
        setClearTrigger(!clearTrigger);
    };

    const onAutoDetectTaskForActiveBackendIntegration = () => {
        setNote('');
        setNoTaskFoundDisplayAlert(false);
    };

    //data-elevation is fix for trello card modal (it close when click on context menu)
    return (
        <div
            ref={node}
            className={`context-menu  ${!open ? "context-menu--hidden" : ""} ${showBackendIntegrationAdMessage ? "context-menu-extended-height" : ""}`}
            style={props.position}
            data-elevation={open ? "2" : ""}
        >
            <Header />
            {
                isBackendIntegration && noTaskFoundDisplayAlert &&
                <div className="context-menu__info-field">{taskNotFoundInBackendIntegrationInfo}</div>
            }
            <BackendIntegrationAdMessage
                visible={isBackendIntegration && showBackendIntegrationAdMessage}
                isAdmin={isAdmin}
                userId={userId}
                service={props.service}
                browser={browser}
                onClose={(e) => {
                    e.stopPropagation();
                    browser.runtime.sendMessage({
                        type: 'saveUserSetting',
                        name: GroupSetting.DONT_SHOW_BE_INTEGRATION_AD,
                        userId: userId,
                        value: 1
                    }).then(() => {
                    });
                    setShowBackendIntegrationAdMessage(false);
                }}
            />
            <TaskPicker
                browser={browser}
                onTaskClick={
                    (task) => {
                        setBillable(task.billable);
                        setTaskId(task.id);
                    }
                }
                onNotFoundTaskForActiveBackendIntegration={onNotFoundTaskForActiveBackendIntegration}
                onAutoDetectTaskForActiveBackendIntegration={onAutoDetectTaskForActiveBackendIntegration}
                userId={userId}
                clearTrigger={clearTrigger}
                presetTaskByExternalId={isBackendIntegration ? externalTaskId : null}
            />
            {isTagModuleEnabled && renderTagPicker()}
            <Note
                note={note}
                onNoteChange={(newNote) => {setNote(newNote)}}
            />
            {
                billableInputVisibility &&
                <Billable
                    billable={billable}
                    onBillableChange={(newBillable) => {setBillable(newBillable)}}
                />
            }
            <Footer
                idDisabled={!isSelectedTagsValid}
                onClickSave={onClickSave}
                onClickCancel={onClickCancel}
            />
        </div>
    );
};

export default ContextMenu;
