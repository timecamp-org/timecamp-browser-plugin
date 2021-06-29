const DEBUG = process.env.DEBUG;
const EMPTY_NAME = '(No title)';

import browser from 'webextension-polyfill';
import ApiService from './ApiService';
import Logger from './Logger';
import StorageManager from './StorageManager';
import GroupSetting from "./GroupSetting";
import FeatureFlag from "./FeatureFlag";

window.apiService = new ApiService();
window.logger = new Logger();
window.storageManager = new StorageManager();

window.TcButton = {
    currentEntry: undefined,
    isUserLogged: false,
    newMessage: function (request, sender, sendResponse) {
        return new Promise((resolve, reject) => {
            try {
                switch (request.type) {
                    case 'timeEntry':
                        TcButton.createTimeEntry(request)
                            .then((response) => {
                                let currentEntry = TcButton.createCurrentEntryObject(
                                    request.startTime,
                                    response.name,
                                    response.note,
                                    request.externalTaskId,
                                );

                                if (response.message) {
                                    logger.warn(response.message, true);
                                }

                                TcButton.currentEntry = currentEntry;
                                TcButton.updateIcon();

                                resolve(response);
                            });
                        break;

                    case 'stop':
                        TcButton.stopTimeEntry(request, sendResponse).then((data) => {
                            resolve(data)
                        }).catch((data) => {
                            reject(data)
                        });
                        break;

                    case 'currentEntry':
                        if (TcButton.isUserLogged === false) {
                            reject();
                            return;
                        }
                        if (TcButton.currentEntry === undefined) {
                            TcButton.updateCurrentEntry().then(() => {
                                resolve({currentEntry: TcButton.currentEntry});
                            });
                        } else {
                            resolve({currentEntry: TcButton.currentEntry});
                        }
                        break;

                    case 'editEntry':
                        apiService.editEntry(
                            request.entryId,
                            request.billable,
                            request.note,
                            request.taskId,
                            request.service,
                        ).then((response) => {
                            resolve(response);
                        }).catch((error) => {
                            reject(error);
                        });
                        break;

                    case 'getTagLists':
                        apiService.getTagLists(
                            request.tags,
                            request.archived,
                            request.useRestrictions,
                            request.taskId,
                            request.sortedArray,
                            request.service
                        ).then((response) => {
                            resolve(response);
                        }).catch((error) => {
                            reject(error);
                        });
                        break;

                    case 'assignTagsToEntry':
                        apiService.assignTagsToEntry(
                            request.tags,
                            request.entryId
                        ).then((response) => {
                            resolve(response);
                        }).catch((error) => {
                            reject(error);
                        });
                        break;

                    case 'hasBackendIntegrationEnabled':
                        TcButton.getCurrentRootGroup()
                            .then((rootGroupId) => {
                                let key = storageManager.buildKey([rootGroupId, request.integration, 'hasBackendIntegration']);
                                storageManager.get(key).then((data) => {
                                    if (data) {
                                        resolve(data);
                                    } else {
                                        apiService.hasBackendIntegrationEnabled(
                                            request.integration,
                                        ).then((response) => {
                                            storageManager.set(key, response)
                                            resolve(response);
                                        }).catch((error) => {
                                            reject(error);
                                        });
                                    }
                                }).catch((e) => {
                                    reject(e);
                                })
                            })
                            .catch((e) => {
                                reject(e);
                            });
                        break;

                    case 'getDurationFormatFromStorage':
                        TcButton.getCurrentRootGroup()
                            .then((rootGroupId) => {
                                storageManager.get(
                                    storageManager.buildKey([rootGroupId, GroupSetting.HOURS_AND_MINUTES_FORMAT])
                                ).then((data) => {
                                    resolve(data);
                                }).catch((e) => {
                                    reject(e);
                                })
                            })
                            .catch((e) => {
                                reject(e);
                            });
                        break;

                    case 'getBillableInputVisibilityFromStorage':
                        TcButton.getCurrentRootGroup()
                            .then((rootGroupId) => {
                                storageManager.get(
                                    storageManager.buildKey([rootGroupId, GroupSetting.CHANGE_BILLING_FLAG])
                                ).then((data) => {
                                    resolve(data);
                                }).catch((e) => {
                                    reject(e);
                                })
                            })
                            .catch((e) => {
                                reject(e);
                            });
                        break;

                    case 'isTagModuleEnabled':
                        TcButton.getCurrentRootGroup().then((rootGroupId) => {
                            apiService.getGroupSetting('moduleTags', rootGroupId)
                                .then((response) => {
                                    if (response.value) {
                                        resolve(parseInt(response.value));
                                    }
                                    resolve(null)
                                })
                                .catch((e) => {
                                    reject(e);
                                });
                        });
                        break;

                    case 'getRecentlyUsed':
                        apiService.getRecentlyUsed().then((response) => {
                            resolve(response);
                        }).catch((error) => {
                            reject(error);
                        });
                        break;

                    case 'getTaskSearchedByText':
                        TcButton.getCurrentRootGroup().then((rootGroup => {
                            apiService.getTaskSearchedByText(
                                request.searchText, rootGroup
                            ).then((response) => {
                                resolve(response);
                            }).catch((error) => {
                                reject(error);
                            });
                        }));

                        break;

                    case 'getFullTaskTree':
                        apiService.getFullTaskTree().then((response) => {
                            resolve(response);
                        }).catch((error) => {
                            reject(error);
                        });
                        break;

                    case 'logIn':
                        let login = request.login;
                        let password = request.password;
                        if (login !== '' && password !== '') {
                            apiService.logIn(
                                login,
                                password
                            ).then((response) => {
                                if (response.status === 200) {
                                    TcButton.doAfterLogin();
                                    resolve(true);
                                }

                                reject();
                            }).catch(() => {
                                reject(false);
                            });
                        } else {
                            reject(false);
                        }
                        break;

                    case 'getUserData':
                        apiService.me().then((response) => {
                            resolve(response);
                        }).catch((error) => {
                            reject(error);
                        });
                        break;

                    case 'getUserSetting':
                        apiService.getUserSetting(
                            request.name,
                            request.userId,
                            request.timestamp
                        ).then((response) => {
                            resolve(response);
                        }).catch((error) => {
                            reject(error);
                        });
                        break;

                    case 'saveUserSetting':
                        apiService.saveUserSetting(
                            request.name,
                            request.userId,
                            request.value
                        ).then((response) => {
                            resolve(response);
                        }).catch((error) => {
                            reject(error);
                        });
                        break;

                    case 'logOut':
                        apiService.removeStoredToken().then(() => {
                            TcButton.isUserLogged = false;
                            TcButton.currentEntry = null;
                            apiService.rootGroupId = null;
                            apiService.userId = null;

                            TcButton.updateIcon();
                            browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
                                if (tabs.length > 0) {
                                    let activeTab = tabs[0];
                                    browser.tabs.sendMessage(activeTab.id, {"type": "doAfterLogout"});
                                }
                            });

                            resolve();
                        }).catch((error) => {
                            reject(error);
                        });
                        break;

                    case 'isUserLogged':
                        apiService.getStoredToken().then((response) => {
                            if (response !== null) {
                                TcButton.isUserLogged = true;
                                resolve(TcButton.isUserLogged);
                            }
                        }).catch((error) => {
                            TcButton.isUserLogged = false;
                            resolve(TcButton.isUserLogged)
                        });
                        break;
                }
            } catch (e) {
                logger.error(e);
                resolve(undefined);
            }
        });
    },

    createTimeEntry: function (timeEntry) {
        if (!timeEntry) {
            return new Promise((resolve) => {
                resolve({
                    success: false
                });
            });
        }

        if (timeEntry.description === '') {
            timeEntry.description = EMPTY_NAME;
        }

        return new Promise((resolve, reject) => {
            apiService.start(
                timeEntry.description,
                timeEntry.externalTaskId,
                timeEntry.startTime,
                timeEntry.taskId,
                timeEntry.service
            ).then((data) => {
                resolve(data);
            }).catch((data) => {
                reject(data);
            });
        });
    },

    stopTimeEntry: function (timeEntry, sendResponse, cb) {
        TcButton.currentEntry = null;
        TcButton.updateIcon();

        return new Promise((resolve) => {
            apiService.stop(timeEntry.service).then((data) => {
                resolve(data)
            });
        });
    },

    doAfterLogin: () => {
        return new Promise((resolve, reject) => {
            TcButton.isUserLogged = true;
            TcButton.getCurrentRootGroup()
                .then((rootGroupId) => {
                    Promise.all([
                        TcButton.loadAndSaveBillingSetting(rootGroupId),
                        TcButton.loadAndSaveHoursAndMinutesFormatSetting(rootGroupId)
                    ]).then((response) => {
                        browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
                            if (tabs.length > 0) {
                                let activeTab = tabs[0];
                                browser.tabs.sendMessage(activeTab.id, {"type": "doAfterLogin"});
                            }
                        });
                        resolve(response);
                    }).catch((e) => {
                        reject(e);
                    });
                })
                .catch((e) => {
                    reject(e);
                })
            ;

            resolve([])
        });
    },

    loadAndSaveBillingSetting: (rootGroupId) => {
        return new Promise((resolve, reject) => {
            //first check BUDGET feature flag
            apiService.getFeatureFlag(rootGroupId, FeatureFlag.BUDGET).then((response) => {
                let key = storageManager.buildKey([rootGroupId, GroupSetting.CHANGE_BILLING_FLAG]);
                if (response && response.enabled) {
                    TcButton.loadGroupSetting(GroupSetting.CHANGE_BILLING_FLAG, rootGroupId)
                        .then((canUserSeeBillableSwitch) => {
                            if (!canUserSeeBillableSwitch) {
                                apiService.me().then((response) => {
                                    canUserSeeBillableSwitch = response.permissions.role_administrator;
                                    storageManager.set(key, canUserSeeBillableSwitch).then(() => {
                                        resolve();
                                    });
                                    resolve(canUserSeeBillableSwitch);
                                }).catch((error) => {
                                    reject(error);
                                });
                            } else {
                                storageManager.set(key, canUserSeeBillableSwitch).then(() => {
                                    resolve();
                                });
                                resolve(canUserSeeBillableSwitch);
                            }
                        })
                        .catch((e) => {
                            reject(e);
                        });
                } else {
                    storageManager.set(key, false).then(() => {
                        resolve();
                    });
                }
            }).catch((e) => {
                reject(e);
            });
        });
    },

    loadAndSaveHoursAndMinutesFormatSetting: (rootGroupId) => {
        return new Promise((resolve, reject) => {
            TcButton.loadGroupSetting(GroupSetting.HOURS_AND_MINUTES_FORMAT, rootGroupId)
                .then((data) => {
                    storageManager.set(
                        storageManager.buildKey([rootGroupId, GroupSetting.HOURS_AND_MINUTES_FORMAT]),
                        data
                    ).then(() => {
                        resolve(data);
                    });
                })
                .catch((e) => {
                    reject(e);
                });
        });
    },

    loadGroupSetting: (settingName, rootGroupId) => {
        return new Promise((resolve, reject) => {
            apiService.getGroupSetting(settingName, rootGroupId)
                .then((response) => {
                    let data = null;

                    if (response.value) {
                        switch (settingName) {
                            case GroupSetting.CHANGE_BILLING_FLAG:
                                data = !parseInt(response.value);
                                break;

                            case GroupSetting.HOURS_AND_MINUTES_FORMAT:
                                data = parseInt(response.value);
                                break;

                            default:
                                data = response.value;
                        }
                    }
                    resolve(data);
                })
                .catch((e) => {
                    reject(e);
                });
        });
    },

    createCurrentEntryObject: function(start, name, note, externalTaskId) {
        return {
            start: start,
            description: name,
            note: note,
            externalTaskId: externalTaskId
        };
    },

    updateCurrentEntry: function () {
        if (TcButton.isUserLogged === false) {
            return;
        }
        return new Promise((resolve, reject) => {
            apiService.status()
                .then((response) => {
                    let currentEntry = null;
                    let isTimerRunning = response.isTimerRunning;
                    if (isTimerRunning) {
                        currentEntry = TcButton.createCurrentEntryObject(
                            response.start_time,
                            response.name,
                            response.note,
                            response.external_task_id,
                        );
                    }

                    TcButton.currentEntry = currentEntry;
                    TcButton.updateIcon();
                    resolve(TcButton.currentEntry);
                });
        });
    },

    getCurrentRootGroup: function () {
        return new Promise((resolve) => {
            if (TcButton.isUserLogged === false) {
                return;
            }

            if (apiService.rootGroupId) {
                resolve(apiService.rootGroupId);
                return;
            }

            apiService.me().then((meResponse) => {
                let rootGroupId = parseInt(meResponse.root_group_id);
                resolve(rootGroupId);
            });

        });
    },

    updateIcon: function () {
        let imagePath = {
            '19': TcButton.currentEntry ? 'images/icon-19.png' : 'images/icon-19-gray.png',
            '38': TcButton.currentEntry ? 'images/icon-38.png' : 'images/icon-38-gray.png'
        };

        browser.browserAction.setIcon({ path: imagePath });
    },
}

browser.runtime.setUninstallURL('https://forms.gle/R7kQXZbC2vVS4rGD8');
browser.tabs.onUpdated.addListener(TcButton.updateIcon);
browser.runtime.onMessage.addListener(TcButton.newMessage);
setInterval(TcButton.updateCurrentEntry, 30000);
