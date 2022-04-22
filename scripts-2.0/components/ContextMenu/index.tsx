import WrongDatesError from "./Error/WrongDatesError";

const browser = require('webextension-polyfill');
import * as React from "react";
import Header from "../Header";
import Note from "../Note";
import Billable from "../Billable";
import Footer from "../Footer";
import {useEffect, useState, useRef, useMemo} from "react";
import './styles.scss';
import TagPicker from "../TagPicker";
import TaskPicker from "../TaskPicker";
import ContextMenuMessage, {MessageType} from "../ContextMenuMessage";
import MaintenanceModeError from "./Error/MaintenanceModeError";
import GroupSetting from "../../GroupSetting";
import StorageManager from "../../StorageManager";
import ReactHtmlParser from "react-html-parser";
import translate from "../../Translator";
import PathService from '../../PathService';
import Logger from '../../Logger';
import Error, {ErrorType} from "../../Error";
import NoInternetError from "./Error/NoInternetError";
import SubscriptionExpiredError from "./Error/SubscriptionExpiredError";
import UnknownError from "./Error/UnknownError";
import TimeSelectors from "../TimeSelectors";
import DateTime from "../../helpers/DateTime";
import TimeFormatter from "../../TimeFormatter";

const pathService = new PathService();
const logger = new Logger();
const dateTime = new DateTime();
const timeFormatter = new TimeFormatter();

const TRELLO = 'trello';

export interface ContextMenuInterface {
    service: string | React.ReactNode;
    position: object,
    note: string,
    billable: boolean,
    startTimerCallback: Function,
    addTimeEntryCallback: Function,
    onCloseCallback: Function,
    billableInputVisibility: boolean|null,
    externalTaskId: string,
    buttonHash: string|null,
    isBackendIntegration: boolean,
    taskNotFoundInBackendIntegrationInfo: string,
    embedOnPopup?: boolean|null,
    trelloPowerUpAdVisible?: boolean|null,
}

const ContextMenu: React.FC<ContextMenuInterface> = (props) => {
    const node = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(true);
    const [service, setService] = useState(props.service);
    const [note, setNote] = useState(props.note);
    const [billable, setBillable] = useState(props.billable);
    const [billableInputVisibility, setBillableInputVisibility] = useState<boolean|null>(props.billableInputVisibility);
    const [taskId, setTaskId] = useState(0);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [isSelectedTagsValid, setIsSelectedTagsValid] = useState<boolean>(true);
    const [canCreateTags, setCanCreateTags] = useState<boolean>(false);
    const [isTagModuleEnabled, setIsTagModuleEnabled] = useState<boolean>(true);
    const startTimerCallback = props.startTimerCallback;
    const addTimeEntryCallback = props.addTimeEntryCallback;
    const onCloseCallback = props.onCloseCallback;
    const [userId, setUserId] = useState<number>(0);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [clearTrigger, setClearTrigger] = useState<boolean>(false);
    const [clearTriggerForTimePicker, setClearTriggerForTimePicker] = useState<boolean>(false);
    const [externalTaskId, setExternalTaskId] = useState(props.externalTaskId);
    const [buttonHash, setButtonHash] = useState(props.buttonHash);
    const [isBackendIntegration, setIsBackendIntegration] = useState(props.isBackendIntegration);
    const [noTaskFoundDisplayAlert, setNoTaskFoundDisplayAlert] = useState<boolean>(false);
    const [taskNotFoundInBackendIntegrationInfo, setTaskNotFoundInBackendIntegrationInfo]
        = useState<string>(props.taskNotFoundInBackendIntegrationInfo);
    const [taskIdToPreset, setTaskIdToPreset] = useState<number|null>(null);
    const [dontShowAdSettingValue, setDontShowAdSettingValue] = useState<number>(1);
    const [embedOnPopup, setEmbedOnPopup] = useState<boolean>(props.embedOnPopup !== undefined);
    const [trelloPowerUpAdVisible, setTrelloPowerUpAdVisible] = useState<boolean>(props.trelloPowerUpAdVisible ?? false);
    const [errorUnknownVisible, setErrorUnknownVisible] = useState<boolean>(false);
    const [errorUnknownMessage, setErrorUnknownMessage] = useState<string>('');
    const [errorMaintenanceModeVisible, setErrorMaintenanceModeVisible] = useState<boolean>(false);
    const [errorNoInternetVisible, setErrorNoInternetVisible] = useState<boolean>(false);
    const [errorSubscriptionExpiredVisible, setSubscriptionExpiredVisible] = useState<boolean>(false);
    const [durationFormat, setDurationFormat] = useState<number>(timeFormatter.DEFAULT_FORMAT);
    const [startTime, setStartTime] = useState<Date|null>(dateTime.getNowDateForDuration());
    const [stopTime, setStopTime] = useState<Date|null>(null);

    const [wrongDatesErrorMessage, setWrongDatesErrorMessage] = useState<string>('');

    const THIRTY_DAYS_IN_MILISEC = 2592000000;


    useEffect(() => {
        setNote(props.note);
        setBillable(props.billable);
        setBillableInputVisibility(props.billableInputVisibility);
        setService(props.service);
        setExternalTaskId(props.externalTaskId);
        setButtonHash(props.buttonHash);
        setTaskIdToPreset(null);
        setIsBackendIntegrationAndUserHasIntegration(props.isBackendIntegration);
        setTaskNotFoundInBackendIntegrationInfo(props.taskNotFoundInBackendIntegrationInfo);
        setEmbedOnPopup(props.embedOnPopup !== undefined);
        setOpen(true);
        document.addEventListener("click", onClickOutside);

        return () => {
            document.removeEventListener("click", onClickOutside);
        };
    }, [props]);


    useMemo(() => {
        if (service === TRELLO) {
            browser.runtime.sendMessage({
                type: 'getSettingFromStorage',
                name: StorageManager.TRELLO_POWER_UP_AD_VISIBLE
            }).then((value) => {
                if (value !== false) {
                    setTrelloPowerUpAdVisible(true);
                }
            }).catch(() => {
            });
        }

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

        browser.runtime.onMessage.addListener((request) => {
            switch (request.type) {
                case 'requestOk':
                    setErrorMaintenanceModeVisible(false);
                    setErrorNoInternetVisible(false);
                    setSubscriptionExpiredVisible(false);
                    break;

                case 'requestError':
                    let error: Error = request.error;
                    switch (error.type) {
                        case ErrorType.MAINTENANCE_MODE:
                            setErrorMaintenanceModeVisible(true);
                            break;
                        case ErrorType.NO_INTERNET:
                            setErrorNoInternetVisible(true);
                            break;
                        case ErrorType.SUBSCRIPTION_EXPIRED:
                            setSubscriptionExpiredVisible(true);
                            break;
                        case ErrorType.UNKNOWN:
                            setErrorUnknownVisible(true);
                            setErrorUnknownMessage(error.message);
                            break;
                        default:
                            logger.log('Missing error type: ' + error.type)
                    }

                    if (error.type !== ErrorType.MAINTENANCE_MODE) {
                        setErrorMaintenanceModeVisible(false);
                    }

                    break;
                default:
                    break;
            }
        });

        browser.runtime.sendMessage({
            type: 'getDurationFormatFromStorage'
        }).then((valueOfDurationFormat) => {
            setDurationFormat(valueOfDurationFormat);
        }).catch(() => {
        });
    }, []);

    const getBackendIntegrationAdData = (userId: number) => {
        browser.runtime.sendMessage({
            type: 'getUserSetting',
            name: GroupSetting.DONT_SHOW_BE_INTEGRATION_AD,
            userId: userId,
            timestamp: true
        }).then((resolve) => {
            if(resolve.modify_time === false || (new Date().getTime() - new Date(resolve.modify_time).getTime()) > THIRTY_DAYS_IN_MILISEC) {
                setDontShowAdSettingValue(0);
                return;
            }

            if(parseInt(resolve.value) > 0) {
                setDontShowAdSettingValue(parseInt(resolve.value));
                return;
            }

            if(resolve.value === "" || parseInt(resolve.value) === 0) {
                setDontShowAdSettingValue(0);
                return;
            }

        }).catch(() => {
            setDontShowAdSettingValue(0);
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
                let googleCalendarTaskId = parseInt(isBackendActiveIntegration);
                if (googleCalendarTaskId > 0) {
                    setTaskIdToPreset(googleCalendarTaskId);
                } else {
                    setTaskIdToPreset(null);
                }
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

        if (stopTime === null) {
            startTimer(dateTime.formatToYmdHis(startTime));
        } else {
            addTimeEntry(startTime, stopTime);
        }

        clearAndClose();
    };

    const startTimer = (startTimeFormatted) => {
        startTimerCallback(
            taskId,
            note,
            service,
            externalTaskId,
            buttonHash,
            startTimeFormatted
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
                assignTagsToEntry(response.entry_id, selectedTags);
            }
        });
    };

    const addTimeEntry = (startTime, stopTime) => {
        addTimeEntryCallback(
            taskId,
            note,
            service,
            externalTaskId,
            buttonHash,
            billable,
            startTime,
            stopTime,
        ).then((response) => {
            if(selectedTags.length) {
                assignTagsToEntry(response.entry_id, selectedTags);
            }
        });
    };

    const assignTagsToEntry = (entry_id, selectedTags) => {
        browser.runtime.sendMessage({
            type: "assignTagsToEntry",
            entryId: entry_id,
            tags: selectedTags
        }).then(() => {
        })
    };

    const onClickCancel = (e) => {
        e.stopPropagation();
        onCloseCallback();

        if (!embedOnPopup) {
            clearAndClose();
        }
    };

    const clearAndClose = () => {
        setClearTriggerForTimePicker(!clearTriggerForTimePicker);
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
        if (taskIdToPreset === null) {
            setNoTaskFoundDisplayAlert(true);
        }
        setTaskId(0);
        setClearTrigger(!clearTrigger);
    };

    const onAutoDetectTaskForActiveBackendIntegration = () => {
        if (taskIdToPreset === null) {
            setNote('');
        }
        setNoTaskFoundDisplayAlert(false);
    };

    const getIntegrationAdMessage = () => {
        if (isAdmin) {
            return ReactHtmlParser((translate('backend_integration_ad_message_admin')
                    .replace('*service*', pathService.getIntegrationNameFromMessage(service))
                    .replace('*linkStart*', "<a style='text-transform: capitalize; text-decoration: none; color: #2380e3;' target='_blank' href='" + pathService.getIntegrationUrl(service) + "'>")
                    .replace('*linkClose*', '</a>')
            ))
        }

        return ReactHtmlParser((translate('backend_integration_ad_message_user')
            .replace('*service*', pathService.getIntegrationNameFromMessage(service))
            .replace('*linkStart*', "<a style='text-transform: capitalize; text-decoration: none; color: #2380e3;' target='_blank' href='" + pathService.getIntegrationMarketingWebsiteUrl(service) + "'>")
            .replace('*linkClose*', '</a>')));
    };

    //data-elevation is fix for trello card modal (it close when click on context menu)
    return (
        <div
            ref={node}
            className={`context-menu  ${!open ? "context-menu--hidden" : ""} ${props.isBackendIntegration && !isBackendIntegration && dontShowAdSettingValue === 0 ? "context-menu-extended-height" : ""}`}
            style={props.position}
            data-elevation={open ? "2" : ""}
        >
            <div className={'context-menu-overflow-wrapper'}>
                <NoInternetError visible={errorNoInternetVisible}/>

                <MaintenanceModeError visible={errorMaintenanceModeVisible}/>

                <SubscriptionExpiredError visible={errorSubscriptionExpiredVisible}/>

                <Header />

                <UnknownError
                    visible={errorUnknownVisible}
                    message={errorUnknownMessage}
                    onCloseCallback={(e) => {
                        e.stopPropagation();
                        setErrorUnknownVisible(false);
                    }}
                />

                <ContextMenuMessage
                    visible={isBackendIntegration && noTaskFoundDisplayAlert}
                    onClose={(e) => {
                        e.stopPropagation();
                        setNoTaskFoundDisplayAlert(false);
                    }}
                    message={taskNotFoundInBackendIntegrationInfo}
                    style={MessageType.MESSAGE_TYPE_INFO}
                    bottomCloseSectionVisible={false}
                    topCloseSectionVisible={true}
                    iconVisible={false}
                />

                <ContextMenuMessage
                    visible={props.isBackendIntegration && !isBackendIntegration && dontShowAdSettingValue === 0}
                    onClose={(e) => {
                        e.stopPropagation();
                        browser.runtime.sendMessage({
                            type: 'saveUserSetting',
                            name: GroupSetting.DONT_SHOW_BE_INTEGRATION_AD,
                            userId: userId,
                            value: (dontShowAdSettingValue + 1)
                        }).then(() => {
                        });
                        setDontShowAdSettingValue(dontShowAdSettingValue + 1);
                    }}
                    message={getIntegrationAdMessage()}
                />

                <ContextMenuMessage
                    visible={trelloPowerUpAdVisible}
                    onClose={(e) => {
                        e.stopPropagation();

                        browser.runtime.sendMessage({
                            type: 'saveSettingToStorage',
                            name: StorageManager.TRELLO_POWER_UP_AD_VISIBLE,
                            value: false
                        }).then(() => {
                        }).catch(() => {
                        });
                        setTrelloPowerUpAdVisible(false);
                    }}
                    message={translate('trello_powerup_ad')}
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
                    presetTaskByTaskId={taskIdToPreset}
                />
                {isTagModuleEnabled && renderTagPicker()}
                <Note
                    note={note}
                    onNoteChange={(newNote) => {setNote(newNote)}}
                />
                <TimeSelectors
                    is12hFormat={false}
                    startTime={startTime}
                    stopTime={stopTime}
                    clearFormTrigger={clearTriggerForTimePicker}
                    durationFormat={durationFormat}
                    onStartTimeValueChange={(value) => {
                        setStartTime(value);
                        const now = new Date();
                        setWrongDatesErrorMessage(now < value ? translate('Start time cannot be greater than now') : '');
                    }}
                    onStopTimeValueChange={(value) => {
                        setStopTime(value);
                    }}
                />
                <WrongDatesError message={wrongDatesErrorMessage} visible={wrongDatesErrorMessage !== ''}/>
                {
                    billableInputVisibility &&
                    <Billable
                        billable={billable}
                        onBillableChange={(newBillable) => {setBillable(newBillable)}}
                    />
                }
            </div>

            <Footer
                idDisabled={!isSelectedTagsValid || wrongDatesErrorMessage !== ''}
                onClickSave={onClickSave}
                onClickCancel={onClickCancel}
                showAddEntryButton={stopTime !== null}
            />
        </div>
    );
};

export default ContextMenu;
