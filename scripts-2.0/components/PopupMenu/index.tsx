const browser = require('webextension-polyfill');
import * as React from "react";
import Header from "../Header";
import {useEffect, useState, useMemo} from "react";
import WorkingTimerSection from "./WorkingTimerSection";
import Footer from "./Footer";
import './styles.scss';
import LoginWindow from "../LoginWindow";
import ContextMenu from "../ContextMenu";
import Gravatar from "../../helpers/Gravatar";
import DateTime from "../../helpers/DateTime";

const gravatar = new Gravatar();
const dateTime = new DateTime();

export interface PopupMenuInterface {
}

export interface User {
    displayName: string;
    email: string;
    gravatarUrl: string;
}

export interface Entry {
    taskName: string;
    note: string;
    startedAt: string|null;
    breadcrumb: string|null;
    color: string|null;
}

const PopupMenu: React.FC<PopupMenuInterface> = (props) => {
    const emptyUser = {
        displayName: '',
        email: '',
        gravatarUrl: gravatar.getDefaultImageUrl(),
    }

    const emptyEntry = {
        taskName: '(no task)',
        note: '',
        startedAt: null,
        breadcrumb: null,
        color: '#aaa',
    }

    const [isUserWindowOpen, setIsUserWindowOpen] = useState(false);
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
    const [isUserLogged, setIsUserLogged] = useState(false);
    const [user, setUser] = useState<User>(emptyUser);
    const [entry, setEntry] = useState<Entry>(emptyEntry);
    const [isTimerWorking, setIsTimerWorking] = useState(false);

    const setCurrentEntry = (currentEntry) => {
        if (currentEntry === null) {
            setIsTimerWorking(false);
            return;
        }

        let entry = {
            taskName: currentEntry.description !== undefined ? currentEntry.description : emptyEntry.taskName,
            note: currentEntry.note,
            startedAt: currentEntry.start,
            color: currentEntry.color,
            breadcrumb: currentEntry.breadcrumb,
        } as Entry;

        setIsTimerWorking(true);
        setEntry(entry);
    };

    const updateUser = () => {
        browser.runtime.sendMessage({
            type: "getUserData"
        }).then((user) => {
            createAndSetUserObject(user);
        });
    };

    const createAndSetUserObject = (user) => {
        let userObj = {
            displayName: user.display_name,
            email: user.email,
            gravatarUrl: gravatar.getGravatarUrlForEmail(user.email)
        } as User;

        setUser(userObj);
    };

    const logOut = () => {
        browser.runtime.sendMessage({
            type: 'logOut'
        }).then(() => {
            setIsUserWindowOpen(false);
            setIsUserLogged(false);
            setUser(emptyUser);
        }).catch(() => {
        });
    };

    const stopTimer = () => {
        browser.runtime.sendMessage({
            type: 'stop'
        }).then(() => {
            setIsTimerWorking(false);
            setEntry(emptyEntry);
        }).catch(() => {
        });
    };

    const startTimer = (
        taskId,
        note,
        service,
        externalTaskId
    ) => {
        return new Promise((resolve, reject) => {
            let startTime = dateTime.now();

            browser.runtime.sendMessage({
                type: 'timeEntry',
                startTime: startTime,
                externalTaskId: externalTaskId,
                taskId: taskId,
                description: note,
                service: service,
                buttonHash: ''
            }).then((response) => {
                setIsTimerWorking(true);
                setIsContextMenuOpen(false);

                let entry = {
                    taskName: response.name === null ? emptyEntry.taskName : response.name,
                    note: note,
                    startedAt: startTime,
                    color: emptyEntry.color
                } as Entry;

                setEntry(entry);
                resolve(response);
            }).catch((e) => {
                reject(e);
            });
        });
    };

    useEffect(() => {
    }, [props]);

    useMemo(() => {
        browser.runtime.sendMessage({
            type: "isUserLogged"
        }).then((isUserLogged) => {
            setIsUserLogged(!!isUserLogged)
        });

        updateUser();

        browser.runtime.sendMessage({
            type: "currentEntry"
        }).then((data) => {
            setCurrentEntry(data.currentEntry);
        });

        browser.runtime.onMessage.addListener((request) => {
            switch (request.type) {
                case 'currentEntryUpdated':
                    setCurrentEntry(request.currentEntry);
                    break;
                default:
                    break;
            }
        });
    }, []);

    return (
        <div className='popup-container'>
            <div className={`tc-popup ${!isUserLogged || isContextMenuOpen ? 'tc-popup--hidden' : ''}`}>
                <Header />
                <WorkingTimerSection
                    isTimerWorking={isTimerWorking}
                    entry={entry}
                    stopTimerCallback={stopTimer}
                />
                <Footer
                    isUserWindowOpen={isUserWindowOpen}
                    user={user}
                    logoutCallback={logOut}
                    onPlusButtonClickCallback={()=>{setIsContextMenuOpen(true);}}
                />
            </div>

            {!isUserLogged && <div className='timecamp login-window-wrapper'>
                <LoginWindow
                    position={{ left: 0, top: 0 }}
                />
            </div>}

            {isContextMenuOpen && <div className='timecamp'>
                <ContextMenu
                    service={'chrome_plugin'}
                    position={{ left: 0, top: 0 }}
                    note={''}
                    billable={true}
                    startTimerCallback={startTimer}
                    billableInputVisibility={null}
                    externalTaskId={''}
                    buttonHash={null}
                    isBackendIntegration={false}
                    taskNotFoundInBackendIntegrationInfo={''}
                    onCloseCallback={() => {setIsContextMenuOpen(false)}}
                    embedOnPopup={true}
                />
            </div>}
        </div>
    );
};

export default PopupMenu;
