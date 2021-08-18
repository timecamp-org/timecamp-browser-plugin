import tcStartButton from '!!raw-loader!./icons/start-button.svg';
import tcStartButtonSmall from '!!raw-loader!./icons/start-button-small.svg';
import tcStopButton from '!!raw-loader!./icons/stop-button.svg';
import tcStopButtonSmall from '!!raw-loader!./icons/stop-button-small.svg';
import TimeFormatter from "./TimeFormatter";
import Logger from "./Logger";
import translate from "./Translator";
import DateTime from "./helpers/DateTime";

import * as React from "react";
import ReactDOM from 'react-dom';
import ContextMenu from './components/ContextMenu/index';
import LoginWindow from './components/LoginWindow/index';

const EXTERNAL_ID_LENGTH_LIMIT = 512;
const DEFAULT_BILLABLE = true;
const browser = require('webextension-polyfill');
const timeFormatter = new TimeFormatter();
const logger = new Logger();
const dateTime = new DateTime();


window.$ = (s, elem) => {
    elem = elem || document;
    return elem.querySelector(s);
};

window.$$ = (s, elem) => {
    elem = elem || document;
    return elem.querySelectorAll(s);
};

window.createTag = (name, className) => {
    const tag = document.createElement(name);
    tag.className = className;

    return tag;
};

function invokeIfFunction (trial) {
    if (trial instanceof Function) {
        return trial();
    }
    return trial;
}

window.tcbutton = {
    element: null,
    serviceName: '',
    currentDescription: '',
    currentProject: '',
    currentTimerStartedAt: null,
    durationFormat: null,
    contextMenuContainer: null,
    loginFormContainer: null,
    lastButtonClicked: null,
    timerInterval: null,
    queryTimerLinkInterval: null,
    billableInputVisibility: null,
    render: function (selector, opts, renderer, mutationSelector) {
        try {
            if (opts.observe) {
                let debouncer = null;
                const observer = new MutationObserver(function (mutations) {
                    if (mutationSelector) {
                        const matches = mutations.filter(function (mutation) {
                            return mutation.target.matches(mutationSelector);
                        });
                        if (!matches.length) {
                            return;
                        }
                    }
                    if (opts.debounceInterval > 0) {
                        if (debouncer) {
                            clearTimeout(debouncer);
                        }
                        debouncer = setTimeout(function () {
                            tcbutton.renderTo(selector, renderer);
                        }, opts.debounceInterval);
                    } else {
                        tcbutton.renderTo(selector, renderer);
                    }
                });
                const observeTarget = opts.observeTarget || document;
                observer.observe(observeTarget, { childList: true, subtree: true });
            } else {
                tcbutton.renderTo(selector, renderer);
            }
        } catch (e) {
            logger.error(e);
        }
    },

    renderTo: function (selector, renderer) {
        let i;
        let len;
        const elems = $$(selector);

        if (!elems.length) {
            return;
        }

        for (i = 0, len = elems.length; i < len; i += 1) {
            try {
                if(renderer(elems[i]) === true) {
                    elems[i].classList.add('tc');
                }
            } catch (e) {
                logger.error(e);
            }
        }

        tcbutton.queryAndUpdateTimerLink();
    },

    buildButtonHash: function (service, desc) {
        return service + '_' + desc
            .split(' ')
            .join('_')
            .substring(0, EXTERNAL_ID_LENGTH_LIMIT)
            .toLowerCase();
    },

    createTimerLink: function (params) {
        let button = createTag('a', 'tc-button');

        const project = invokeIfFunction(params.projectName);
        const description = invokeIfFunction(params.description);
        let taskNotFoundInBackendIntegrationInfo = '';
        let isBackendIntegration = !!params.isBackendIntegration;
        let buttonHash = this.buildButtonHash(params.className, description);
        let externalTaskId = null;
        if (params.externalTaskId) {
            externalTaskId = params.externalTaskId;
        }

        if (params.taskNotFoundInfo && isBackendIntegration) {
            taskNotFoundInBackendIntegrationInfo = translate(params.taskNotFoundInfo);
        }

        tcbutton.currentProject = project;
        tcbutton.currentDescription = description;
        tcbutton.serviceName = params.className;
        button.title = description + (project ? ' - ' + project : '');
        button.dataset.externalTaskId = externalTaskId;
        button.dataset.buttonHash = buttonHash;
        button.classList.add(params.className);

        if (params.additionalClasses) {
            button.classList.add(...params.additionalClasses);
        }

        let startButtonSVG = tcStartButton;
        let stopButtonSVG = tcStopButton;
        if (params.buttonType === 'minimal') {
            button.classList.add('min');
            startButtonSVG = tcStartButtonSmall;
            stopButtonSVG = tcStopButtonSmall;
        }

        button.innerHTML = startButtonSVG;
        button.innerHTML += stopButtonSVG;

        button.addEventListener('click', (e) => {
            tcbutton.onTimerButtonClick(
                e,
                button,
                invokeIfFunction(params.description),
                externalTaskId,
                buttonHash,
                isBackendIntegration,
                taskNotFoundInBackendIntegrationInfo
            );
            tcbutton.lastButtonClicked = button;
        });

        return button;
    },

    isUserLogged: () => {
        return browser.runtime.sendMessage({
            type: 'isUserLogged',
        });
    },

    getPosition: function (height, width) {
        const elemRect = tcbutton.element.getBoundingClientRect();

        return tcbutton.topPosition(elemRect, width, height);
    },

    createContainer: function (className) {
        const div = document.createElement('div');
        const container = document.body;

        if (className) {
            div.classList.add(className);
        }

        return container.appendChild(div)
    },

    showContextMenuWindow: function (
        note,
        externalTaskId,
        buttonHash,
        service,
        isBackendIntegration,
        taskNotFoundInBackendIntegrationInfo
    ) {
        const position = tcbutton.getPosition(563, 440)
        if (tcbutton.contextMenuContainer === null) {
            tcbutton.contextMenuContainer = tcbutton.createContainer('timecamp');
        }

        ReactDOM.render(
            <ContextMenu
                service={service}
                position={position}
                note={note}
                billable={DEFAULT_BILLABLE}
                billableInputVisibility={tcbutton.billableInputVisibility}
                isBackendIntegration={isBackendIntegration}
                externalTaskId={externalTaskId}
                buttonHash={buttonHash}
                startTimerCallback={tcbutton.startTimerCallback}
                onCloseCallback={() => {}}
                taskNotFoundInBackendIntegrationInfo={taskNotFoundInBackendIntegrationInfo}
            />,
            tcbutton.contextMenuContainer
        );
    },

    showLoginWindow: (
        callback,
        note,
        externalTaskId,
        buttonHash,
        serviceName,
        isBackendIntegration,
        taskNotFoundInBackendIntegrationInfo
    ) => {
        const position = tcbutton.getPosition(312, 361)
        if (tcbutton.loginFormContainer === null) {
            tcbutton.loginFormContainer = tcbutton.createContainer('timecamp');
        }

        ReactDOM.render(
            <LoginWindow
                position={position}
                onCorrectLoginCallback={() => {
                    callback(
                        note,
                        externalTaskId,
                        buttonHash,
                        serviceName,
                        isBackendIntegration,
                        taskNotFoundInBackendIntegrationInfo
                    )
                }}
            />,
            tcbutton.loginFormContainer
        );
    },

    startTimerCallback: (taskId, note, service, externalTaskId, buttonHash) => {
        return new Promise((resolve, reject) => {
            let startTime = dateTime.now();
            tcbutton.currentTimerStartedAt = startTime;

            tcbutton.lastButtonClicked.dataset.externalTaskId = externalTaskId;

            tcbutton.deactivateAllTimerLinks();

            browser.runtime.sendMessage({
                type: 'timeEntry',
                startTime: startTime,
                externalTaskId: externalTaskId,
                taskId: taskId,
                description: note,
                service: service,
                buttonHash: buttonHash
            }).then((response) => {
                tcbutton.activateTimerLink(tcbutton.lastButtonClicked);
                tcbutton.queryAndUpdateTimerLink();

                resolve(response);
            }).catch((response) => {
                reject(response);
            });
        });
    },

    onTimerButtonClick: (
        e,
        button,
        note,
        externalTaskId,
        buttonHash,
        isBackendIntegration,
        taskNotFoundInBackendIntegrationInfo
    ) => {
        e.preventDefault();
        e.stopPropagation();
        tcbutton.element = e.currentTarget;

        if (button.classList.contains('active')) {
            tcbutton.deactivateAllButtonsAndStopTimer();
        } else {
            tcbutton.isUserLogged().then((isUserLogged) => {
                if (isUserLogged === true) {
                    tcbutton.showContextMenuWindow(
                        note,
                        externalTaskId,
                        buttonHash,
                        tcbutton.serviceName,
                        isBackendIntegration,
                        taskNotFoundInBackendIntegrationInfo
                    );
                } else {
                    tcbutton.showLoginWindow(
                        tcbutton.showContextMenuWindow,
                        note,
                        externalTaskId,
                        buttonHash,
                        tcbutton.serviceName,
                        isBackendIntegration,
                        taskNotFoundInBackendIntegrationInfo
                    );
                }
            }).catch((error) => {
            });
        }
    },

    deactivateAllButtonsAndStopTimer: () => {
        tcbutton.deactivateAllTimerLinks();
        tcbutton.currentTimerStartedAt = null;
        let opts = {
            type: 'stop',
            respond: true,
            service: tcbutton.serviceName
        };

        browser.runtime.sendMessage(opts)
            .then((response) => {
            })
            .catch((e) => {
                logger.error(e);
            });
    },

    topPosition: function (rect, editFormWidth, editFormHeight) {
        let left = rect.left + 20;
        let top = rect.top + document.body.scrollTop + 40;

        if (left + editFormWidth > window.innerWidth) {
            left = window.innerWidth - 10 - editFormWidth;
        }
        if (top + editFormHeight > window.innerHeight) {
            top = window.innerHeight + document.body.scrollTop - 10 - editFormHeight;
        }

        return { left: left, top: top };
    },

    queryAndUpdateTimerLink: function () {
        browser.runtime.sendMessage({ type: 'currentEntry' })
            .then((currentEntry) => {
                logger.log(currentEntry);
                logger.log(tcbutton);
                if (!currentEntry) {
                    return;
                }

                tcbutton.updateTimerLink(currentEntry.currentEntry);
                let currentTimerStartedAt = null;
                if (currentEntry.currentEntry) {
                    currentTimerStartedAt = currentEntry.currentEntry.start;
                }
                tcbutton.currentTimerStartedAt = currentTimerStartedAt;
            })
            .catch((e) => {
                logger.log(e);
            });
    },

    updateDurationFormat: function () {
        if (tcbutton.durationFormat === null) {
            browser.runtime.sendMessage({ type: 'getDurationFormatFromStorage' })
                .then((durationFormat) => {
                    if (durationFormat !== null) {
                        tcbutton.durationFormat = durationFormat;
                    }
                })
                .catch((e) => {
                    Logger.error(e);
                })
            ;
        }
    },

    updateBillableInputVisibility: function () {
        if (tcbutton.billableInputVisibility === null) {
            browser.runtime.sendMessage({type: 'getBillableInputVisibilityFromStorage'})
                .then((billableInputVisibility) => {
                    if (billableInputVisibility !== null) {
                        tcbutton.billableInputVisibility = billableInputVisibility;
                    }
                })
                .catch((e) => {
                    Logger.error(e);
                })
            ;
        }
    },

    updateTimerLink: function (entry) {
        if (!entry) {
            tcbutton.deactivateAllTimerLinks();
            return;
        }

        let matchingButtons = tcbutton.matchButton(entry.externalTaskId, entry.buttonHash);
        tcbutton.deactivateAllTimerLinks();
        for (const matchingButton of matchingButtons) {
            tcbutton.activateTimerLink(matchingButton);
        }
    },

    matchButton: function (externalTaskId, buttonHash) {
        let buttons = $$('.tc-button:not(.tc-button-edit-form-button)');

        let matchingButtons = [];
        for (const button of buttons) {
            if (button.dataset.externalTaskId === externalTaskId) {
                matchingButtons.push(button);
            }

            if (button.dataset.buttonHash === buttonHash) {
                matchingButtons.push(button);
            }
        }

        return matchingButtons;
    },

    activateTimerLink: function (link) {
        tcbutton.changeButtonsVisibility(link, true);

        if (link.classList.contains('active')) {
            return;
        }

        link.classList.add('active');
    },

    deactivateAllTimerLinks: function () {
        const allActive = document.querySelectorAll(
            '.tc-button.active:not(.tc-button-edit-form-button)');
        for (const active of allActive) {
            tcbutton.deactivateTimerLink(active);
        }
    },

    deactivateTimerLink: function (link) {
        tcbutton.changeButtonsVisibility(link, false);
        link.classList.remove('active');
    },

    changeButtonsVisibility: function (link, timerActive = true) {
        link.querySelector('.tc-stop-button').style.display = timerActive ? 'inline-block' : 'none';
        link.querySelector('.tc-start-button').style.display = timerActive ? 'none' : 'inline-block';
    },

    doAfterLogout: () => {
        tcbutton.deactivateAllTimerLinks();
        if (tcbutton.contextMenuContainer !== null) {
            ReactDOM.unmountComponentAtNode(tcbutton.contextMenuContainer);
            tcbutton.contextMenuContainer = null;
        }

        tcbutton.loginFormContainer = null;
        tcbutton.durationFormat = null;
        tcbutton.billableInputVisibility = null;
    },

    doAfterLogin: () => {
        tcbutton.updateDurationFormat();
        tcbutton.updateBillableInputVisibility();
    },

    newMessage: function (request, sender, sendResponse) {
        switch (request.type) {
            case 'stop-entry':
                tcbutton.updateTimerLink();
                break;
            case 'doAfterLogout':
                tcbutton.doAfterLogout();
                break;
            case 'doAfterLogin':
                tcbutton.doAfterLogin();
                break;
            default:
                return undefined;
        }
    },

    timerUpdate: function () {
        let duration = '';
        if (tcbutton.currentTimerStartedAt) {
            let activeTimerNotMin = document.querySelectorAll(
                '.tc-button.active:not(.min) .tc-stop-button .timer'
            );
            duration = timeFormatter.format(tcbutton.currentTimerStartedAt, tcbutton.durationFormat);

            //timer in button
            for (const activeTimer of activeTimerNotMin) {
                activeTimer.textContent = duration;
            }
        }
    }
};

browser.runtime.onMessage.addListener(tcbutton.newMessage);
window.addEventListener('focus', function (e) {
    tcbutton.isUserLogged().then((isUserLogged) => {
        if (isUserLogged === false) {
            tcbutton.doAfterLogout();
        } else {
            tcbutton.updateDurationFormat();
            tcbutton.updateBillableInputVisibility();
        }
        tcbutton.queryAndUpdateTimerLink();
    });
});

setInterval(tcbutton.timerUpdate, 1000);
setInterval(tcbutton.queryAndUpdateTimerLink, 30000);
