const browser = require("webextension-polyfill");
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import DateTime from "../../helpers/DateTime";
import Gravatar from "../../helpers/Gravatar";
import { getTheme, retrieveThemeFromStorage } from "../../helpers/theme";
import ContextMenu from "../ContextMenu";
import LoginWindow from "../LoginWindow";
import Footer from "./Footer";
import Header from "./Header";
import "./styles.scss";
import WorkingTimerSection from "./WorkingTimerSection";

import { ContextMenuType } from "../ContextMenu/types";
import InfoBox from "../InfoBox";
import { InfoBoxStatus } from "../InfoBox/types";
import Pomodoro from "./Pomodoro";

import StorageManager from "../../StorageManager";
import { PomodoroTypes, isObjValid, isPomodoroTypeValid } from "../../helpers/pomodoro";
import { PomodoroContext, PomodoroContextType, initialPomodoroDurationsState } from "./Pomodoro/PomodoroContext";

const gravatar = new Gravatar();
const dateTime = new DateTime();

export interface PopupMenuInterface {}

export interface User {
  displayName: string;
  email: string;
  gravatarUrl: string;
}

export interface PomodoroDurationValues {
  pomodoroFocusPhase: string;
  pomodoroShortBreak: string;
  pomodoroLongBreak: string;
}

export interface Entry {
  taskName: string;
  note: string;
  startedAt: string | null;
  breadcrumb: string | null;
  color: string | null;
}

const PopupMenu: React.FC<PopupMenuInterface> = (props) => {
  const emptyUser = {
    displayName: "",
    email: "",
    gravatarUrl: gravatar.getDefaultImageUrl(),
  };

  const emptyEntry = {
    taskName: "(no task)",
    note: "",
    startedAt: null,
    breadcrumb: null,
    color: "#aaa",
  };

  const [theme, setTheme] = useState<"default" | "darkmode">("default");
  const [isPomodoroEnabled, setIsPomodoroEnabled] = useState(false);
  const [pomodoroStartedType, setPomodoroStartedType] =
    useState<PomodoroTypes>(PomodoroTypes.FOCUS_PHASE);
  const [isPomodoroOptionsOpen, setIsPomodoroOptionsOpen] = useState(false);
 

  const [ pomodoroDurations, setPomodoroDurations ] = React.useState<PomodoroDurationValues>(initialPomodoroDurationsState)



  useEffect(() => {
    retrieveThemeFromStorage(setTheme);
    browser.runtime
      .sendMessage({
        type: "getSettingFromStorage",
        name: StorageManager.POMODORO_IS_OPTIONS_OPEN,
      })
      .then((value) => {
        setIsPomodoroOptionsOpen(value);
      });
    browser.runtime
      .sendMessage({
        type: "getSettingFromStorage",
        name: StorageManager.POMODORO_IS_ENABLED,
      })
      .then(setIsPomodoroEnabled);
    browser.runtime
      .sendMessage({
        type: "getSettingFromStorage",
        name: StorageManager.POMODORO_TYPE,
      })
      .then((value) => {
        if (!isPomodoroTypeValid(value)) return;
        setPomodoroStartedType(value);
      });
    browser.runtime
      .sendMessage({
        type: "getSettingFromStorage",
        name: StorageManager.POMODORO_DURATION_VALUES,
      })
      .then((values) => {
        const jParsed = JSON.parse(values) || {};

        if (!isObjValid(jParsed)) return;
        
        setPomodoroDurations(jParsed)
      });
    browser.runtime
      .sendMessage({
        type: "getUserData",
      })
      .then((data) => {
        getTheme(data.user_id, setTheme);
      });
  }, []);

  const [isUserWindowOpen, setIsUserWindowOpen] = useState(false);
  const [contextMenuType, setContextMenuType] = useState<
    ContextMenuType | undefined
  >(undefined);
  const [isUserLogged, setIsUserLogged] = useState(false);
  const [user, setUser] = useState<User>(emptyUser);
  const [entry, setEntry] = useState<Entry>(emptyEntry);
  const [isTimerWorking, setIsTimerWorking] = useState(false);
  const [timeEntryAddedInfoBoxStatus, settimeEntryAddedInfoBoxStatus] =
    useState<InfoBoxStatus | undefined>(undefined);

  const setCurrentEntry = (currentEntry) => {
    if (currentEntry === null) {
      setIsTimerWorking(false);
      return;
    }

    let entry = {
      taskName:
        currentEntry.description !== undefined
          ? currentEntry.description
          : emptyEntry.taskName,
      note: currentEntry.note,
      startedAt: currentEntry.start,
      color: currentEntry.color,
      breadcrumb: currentEntry.breadcrumb,
    } as Entry;

    setIsTimerWorking(true);
    setEntry(entry);
  };

  const updateUser = () => {
    browser.runtime
      .sendMessage({
        type: "getUserData",
      })
      .then((user) => {
        createAndSetUserObject(user);
      });
  };

  const createAndSetUserObject = (user) => {
    let userObj = {
      displayName: user.display_name,
      email: user.email,
      gravatarUrl: gravatar.getGravatarUrlForEmail(user.email),
    } as User;

    setUser(userObj);
  };

  const logOut = () => {
    browser.runtime
      .sendMessage({
        type: "logOut",
      })
      .then(() => {
        setIsUserWindowOpen(false);
        setContextMenuType(undefined);
        setIsUserLogged(false);
        setUser(emptyUser);
      })
      .catch(() => {});
  };

  const stopTimer = () => {
    browser.runtime.sendMessage({
      action: "track",
      type: "timerStop",
    });
    browser.runtime
      .sendMessage({
        type: "stop",
      })
      .then(() => {
        setIsTimerWorking(false);
        setEntry(emptyEntry);
      })
      .catch(() => {});
  };

  const startTimer = (
    taskId,
    note,
    service,
    externalTaskId,
    buttonHash,
    startTime,
  ) => {
    return new Promise((resolve, reject) => {
      browser.runtime.sendMessage({
        action: "track",
        type: "timerStart",
      });
      browser.runtime
        .sendMessage({
          type: "startTimer",
          startTime: startTime,
          externalTaskId: externalTaskId,
          taskId: taskId,
          description: note,
          service: service,
          buttonHash: buttonHash,
        })
        .then((response) => {
          setIsTimerWorking(true);
          setContextMenuType(undefined);

          let entry = {
            taskName:
              response.name === null ? emptyEntry.taskName : response.name,
            note: note,
            startedAt: startTime,
            color: emptyEntry.color,
          } as Entry;

          setEntry(entry);
          resolve(response);
        })
        .catch((e) => {
          reject(e);
        });
    });
  };

  const addTimeEntry = (
    taskId,
    note,
    service,
    externalTaskId,
    buttonHash,
    billable,
    startTime,
    stopTime,
  ) => {
    return new Promise((resolve, reject) => {
      browser.runtime
        .sendMessage({
          type: "addTimeEntry",
          date: dateTime.formatToYmd(startTime),
          startTime: dateTime.formatToHis(startTime),
          endTime: dateTime.formatToHis(stopTime),
          billable: billable,
          externalTaskId: externalTaskId,
          taskId: taskId,
          description: note,
          service: service,
          buttonHash: buttonHash,
        })
        .then((response) => {
          settimeEntryAddedInfoBoxStatus(InfoBoxStatus.SUCCESS);
          resolve(response);
        })
        .catch((response) => {
          settimeEntryAddedInfoBoxStatus(InfoBoxStatus.ERROR);
          reject(response);
        });
    });
  };

  useEffect(() => {}, [props]);

  useMemo(() => {
    browser.runtime
      .sendMessage({
        type: "isUserLogged",
      })
      .then((isUserLogged) => {
        setIsUserLogged(!!isUserLogged);
      });

    updateUser();

    browser.runtime
      .sendMessage({
        type: "currentEntry",
      })
      .then((data) => {
        setCurrentEntry(data.currentEntry);
      });

    browser.runtime.onMessage.addListener((request) => {
      switch (request.type) {
        case "currentEntryUpdated":
          setCurrentEntry(request.currentEntry);
          break;
        default:
          break;
      }
    });
  }, []);

  const pomodoroContextValue :PomodoroContextType = {
    type: [pomodoroStartedType, setPomodoroStartedType],
    pomodoroDurations: [pomodoroDurations, setPomodoroDurations],
    isPomodoroOptionsOpen: [isPomodoroOptionsOpen, setIsPomodoroOptionsOpen],
    isPomodoroEnabled: [isPomodoroEnabled, setIsPomodoroEnabled]
    
  }

  return (
      <PomodoroContext.Provider value={pomodoroContextValue}>
        <div className="popup-container">
          <div
            className={`tc-popup ${!isUserLogged || contextMenuType ? "tc-popup--hidden" : ""}`}
            data-theme={theme}
          >
            <Header
              user={user}
              logoutCallback={logOut}
              isUserWindowOpen={isUserWindowOpen}
              setIsUserWindowOpen={setIsUserWindowOpen}
              theme={theme}
            />
            <InfoBox
              status={timeEntryAddedInfoBoxStatus}
              onClose={() => settimeEntryAddedInfoBoxStatus(undefined)}
            />
            <WorkingTimerSection
              isTimerWorking={isTimerWorking}
              entry={entry}
              stopTimerCallback={stopTimer}                        
            />
            <Pomodoro/>
            <Footer                        
              user={user}
              logoutCallback={logOut}
              onPlusButtonClickCallback={() => {}}
              onSetContextMenuType={setContextMenuType}
            />
          </div>

          {!isUserLogged && (
            <div className="timecamp login-window-wrapper">
              <LoginWindow position={{ left: 0, top: 0 }} />
            </div>
          )}

          {contextMenuType && (
            <div className="timecamp">
              <ContextMenu
                service={"chrome_plugin"}
                position={{ left: 0, top: 0 }}
                note={""}
                billable={true}
                startTimerCallback={startTimer}
                addTimeEntryCallback={
                  contextMenuType === ContextMenuType.ENTRY
                    ? addTimeEntry
                    : undefined
                }
                isPomodoroEnabled={isPomodoroEnabled}
                billableInputVisibility={null}
                externalTaskId={""}
                buttonHash={null}
                isBackendIntegration={false}
                taskNotFoundInBackendIntegrationInfo={""}
                onCloseCallback={() => {
                  setContextMenuType(undefined);
                }}
                embedOnPopup={true}
              />
            </div>
          )}
        </div>
      </PomodoroContext.Provider>
  );
};

export default PopupMenu;
