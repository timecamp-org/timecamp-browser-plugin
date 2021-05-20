import moment from 'moment';
import tcStartButton from '!!raw-loader!./icons/start-button.svg';
import tcStartButtonSmall from '!!raw-loader!./icons/start-button-small.svg';
import tcStopButton from '!!raw-loader!./icons/stop-button.svg';
import tcStopButtonSmall from '!!raw-loader!./icons/stop-button-small.svg';
import TimeFormatter from "./TimeFormatter";
import Logger from "./Logger";

import * as React from "react";
import ReactDOM from 'react-dom';
import ContextMenu from './components/ContextMenu/index';
import LoginWindow from './components/LoginWindow/index';

const EXTERNAL_ID_LENGTH_LIMIT = 512;
const DEFAULT_BILLABLE = true;
const browser = require('webextension-polyfill');
const timeFormatter = new TimeFormatter();
const logger = new Logger();


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
            }
            tcbutton.renderTo(selector, renderer);
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
            elems[i].classList.add('tc');
        }

        try {
            for (i = 0, len = elems.length; i < len; i += 1) {
                renderer(elems[i]);
            }

            tcbutton.queryAndUpdateTimerLink();
        } catch (e) {
            logger.error(e);
        }
    },

    buildExternalTaskId: function (service, desc) {
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
        const externalTaskId = this.buildExternalTaskId(params.className, description);

        tcbutton.currentProject = project;
        tcbutton.currentDescription = description;
        tcbutton.serviceName = params.className;
        button.title = description + (project ? ' - ' + project : '');
        button.dataset.externalTaskId = externalTaskId;
        button.classList.add(params.className);

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
            tcbutton.onTimerButtonClick(e, button, description);
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

    createContainer: function () {
        const div = document.createElement('div');
        const container = document.body;

        return container.appendChild(div)
    },

    showContextMenuWindow: function (note, service) {
        const position = tcbutton.getPosition(563, 440)
        if (tcbutton.contextMenuContainer === null) {
            tcbutton.contextMenuContainer = tcbutton.createContainer();
        }

        ReactDOM.render(
            <ContextMenu
                service={service}
                position={position}
                note={note}
                billable={DEFAULT_BILLABLE}
                startTimerCallback={tcbutton.startTimerCallback}
            />,
            tcbutton.contextMenuContainer
        );
    },

    showLoginWindow: (callback, note, serviceName) => {
        const position = tcbutton.getPosition(312, 361)
        if (tcbutton.loginFormContainer === null) {
            tcbutton.loginFormContainer = tcbutton.createContainer();
        }

        ReactDOM.render(
            <LoginWindow
                position={position}
                onCorrectLoginCallback={() => {
                    callback(note, serviceName)
                }}
            />,
            tcbutton.loginFormContainer
        );
    },

    startTimerCallback: (taskId, note, service) => {
        return new Promise((resolve, reject) => {
            let startTime = moment().format("YYYY-MM-DD HH:mm:ss");
            tcbutton.currentTimerStartedAt = startTime;

            const externalTaskId = tcbutton.buildExternalTaskId(service, note);
            tcbutton.lastButtonClicked.dataset.externalTaskId = externalTaskId;

            browser.runtime.sendMessage({
                type: 'timeEntry',
                startTime: startTime,
                externalTaskId: externalTaskId,
                taskId: taskId,
                description: note,
                service: service,
            }).then((response) => {
                tcbutton.activateTimerLink(tcbutton.lastButtonClicked);

                resolve(response);
            }).catch((response) => {
                reject(response);
            });
        });
    },

    onTimerButtonClick: (e, button, note) => {
        e.preventDefault();
        e.stopPropagation();
        tcbutton.element = e.currentTarget;

        if (button.classList.contains('active')) {
            tcbutton.deactivateAllButtonsAndStopTimer(button);
        } else {
            tcbutton.isUserLogged().then((isUserLogged) => {
                if (isUserLogged === true) {
                    tcbutton.showContextMenuWindow(note, tcbutton.serviceName);
                } else {
                    tcbutton.showLoginWindow(tcbutton.showContextMenuWindow, note, tcbutton.serviceName);
                }
            }).catch((error) => {
            });
        }
    },

    deactivateAllButtonsAndStopTimer: (button) => {
        tcbutton.deactivateTimerLink(button);
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
        tcbutton.updateDurationFormat();

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
            .catch(() => {
            });
    },

    updateDurationFormat: function () {
        if (tcbutton.durationFormat === null) {
            browser.runtime.sendMessage({ type: 'updateDurationFormat' })
                .then((durationFormat) => {
                    if (durationFormat !== null) {
                        tcbutton.durationFormat = durationFormat;
                    }
                });
        }
    },

    updateTimerLink: function (entry) {
        if (!entry) {
            tcbutton.deactivateAllTimerLinks();
            return;
        }

        let matchingButton = tcbutton.matchButton(entry.externalTaskId, entry.note)
        if (matchingButton) {
            tcbutton.activateTimerLink(matchingButton);
        } else {
            tcbutton.deactivateAllTimerLinks();
        }
    },

    matchButton: function (externalTaskId, note) {
        let buttons = $$('.tc-button:not(.tc-button-edit-form-button)');

        for (const button of buttons) {
            if (button.dataset.externalTaskId === externalTaskId) {
                return button;
            }
        }

        const externalTaskIdToMach = this.buildExternalTaskId(tcbutton.serviceName, note);
        for (const button of buttons) {
            if (button.dataset.externalTaskId === externalTaskIdToMach) {
                return button;
            }
        }
    },

    activateTimerLink: function (link) {
        tcbutton.changeButtonsVisibility(link, true);

        if (link.classList.contains('active')) {
            return;
        }

        tcbutton.deactivateAllTimerLinks();
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

    cleanupAfterLogout: function () {
        window.tcbutton.deactivateAllTimerLinks();
        if (window.tcbutton.contextMenuContainer !== null) {
            ReactDOM.unmountComponentAtNode(window.tcbutton.contextMenuContainer);
            window.tcbutton.contextMenuContainer = null;
        }
    },

    newMessage: function (request, sender, sendResponse) {
        if (request.type === 'stop-entry') {
            tcbutton.updateTimerLink();
        }
        if (request.type === 'cleanupAfterLogout') {
            tcbutton.cleanupAfterLogout();
        }

        return undefined;
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
            tcbutton.cleanupAfterLogout();
        }
        tcbutton.queryAndUpdateTimerLink();
    });
});

setInterval(tcbutton.timerUpdate, 1000);
setInterval(tcbutton.queryAndUpdateTimerLink, 30000);
