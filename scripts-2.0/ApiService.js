import PathService from './PathService';
import Logger from './Logger';
import browser from "webextension-polyfill";
import Response from "./Response";
import StorageManager from "./StorageManager";

const pathService = new PathService();
const logger = new Logger();

const METHOD_GET = 'GET';
const METHOD_POST = 'POST';
const METHOD_PUT = 'PUT';

const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID;

export default class ApiService {
    defaultServiceName = 'ChromePlugin';
    rootGroupId = null;
    userId = null;
    discoveryEndpointChecked = false;
    storageManager = new StorageManager();

    constructor() {
    }

    reloadCustomDomain() {
        pathService.init();
    }

    setSuitableDomain() {
        this.discovery().then((response) => {
            pathService.changeBaseUrl(response);
            this.me().then((response) => {
                this.rootGroupId = parseInt(response.root_group_id);
                this.userId = parseInt(response.user_id);
            }).catch((response) => {
                return false;
            }).catch((response) => {
                return false;
            });
        });

        return true;
    }

    handleErrors(xhr) {
        const response = new Response(xhr);
        if (!response.hasError) {
            browser.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
                if (tabs.length > 0) {
                    let activeTab = tabs[0];
                    browser.tabs.sendMessage(activeTab.id, {
                        type: 'requestOk',
                    });
                }
            });

            browser.runtime.sendMessage({
                type: 'requestOk',
            }).then(() => {
            }).catch(() => {
            });

            return;
        }

        browser.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
            if (tabs.length > 0) {
                let activeTab = tabs[0];
                browser.tabs.sendMessage(activeTab.id, {
                    type: 'requestError',
                    error: response.error
                });
            }
        });

        browser.runtime.sendMessage({
            type: 'requestError',
            error: response.error
        }).then(() => {
        }).catch(() => {
        });
    }

    call(opts) {
        if (!this.discoveryEndpointChecked) {
            this.discoveryEndpointChecked = true;
            const isSetCorrectly = this.setSuitableDomain();
            if (!isSetCorrectly) {
                setTimeout(() => {
                    this.discoveryEndpointChecked = false;
                }, 60 * 1000);
            }
        }

        return new Promise((resolve, reject) => {
            const requestOptions = {
                method: '',
                headers: {},
            }
            const method = opts.method || METHOD_GET;
            const apiToken = opts.apiToken;
            let url = opts.url;

            if (opts.queryStringParams) {
                let queryStringParams = new URLSearchParams(opts.queryStringParams).toString();
                url = url + '?' + queryStringParams
            }

            logger.log('Request:')
            logger.table(opts);

            requestOptions.method = method;

            if (opts.contentType) {
                requestOptions['headers']['Content-Type'] = opts.contentType
            } else {
                requestOptions['headers']['Content-Type'] = 'application/json'
            }

            if (opts.accept) {
                requestOptions['headers']['Accept'] = opts.accept
            } else {
                requestOptions['headers']['Accept'] = 'Application/json'
            }

            if (apiToken) {
                requestOptions['headers']['Authorization'] = 'Bearer ' + apiToken
            }


            let body;
            if (opts.bodyAsQueryString === true) {
                let payload = opts.payload;
                body = Object.keys(payload).map(key => key + '=' + encodeURIComponent(payload[key])).join('&')
            } else {
                body = JSON.stringify(opts.payload);
            }

            if (body && method != METHOD_GET) {
                requestOptions.body = body
            }

            fetch(url, requestOptions)
                .then(async function (response) {
                    const result = {
                        status: response.status,
                        response: await response.text(),
                    };

                    if (!response.ok) {
                        reject(result);
                        return;
                    }

                    resolve(result);
                })
                .catch(function (error) {
                    const result = error && error.status
                        ? error
                        : { status: 500, response: error };
                    console.log(result);
                    reject(result);
                });
        });
    }

    authorizeAndCall(callback) {
        return new Promise((resolve, reject) => {
            this.getToken()
                .then((token) => {
                    callback(token, resolve, reject)
                })
                .catch(() => {
                    logger.error('user logged out', true);
                    reject('error');
                });
        });
    }

    authorizeNextAndCall(callback) {
        return new Promise((resolve, reject) => {
            this.getNextToken()
                .then((token) => {
                    callback(token, resolve, reject)
                })
                .catch((e) => {
                    logger.error('user logged out from next', true);
                    reject('error');
                });
        });
    }

    status(service = this.defaultServiceName) {
        return this.authorizeAndCall((token, resolve, reject) => {
            this.call({
                url: pathService.getStatusUrl(),
                method: METHOD_GET,
                apiToken: token,
                queryStringParams: { service: service },
            })
                .then((response) => {
                    let responseData = JSON.parse(response.response);
                    resolve(this.mapV3TimerStatusToLegacy(responseData));
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response);
                });
        }
        );
    }

    start(
        title,
        externalTaskId,
        buttonHash,
        startedAt,
        taskId = null,
        service = this.defaultServiceName
    ) {

        return this.authorizeAndCall((token, resolve, reject) => {
            let data = {
                service: service,
                entryId: 'create',
                note: title,
                externalTaskId: externalTaskId || null,
                externalTaskName: externalTaskId ? title : null,
                startedAt: startedAt,
                browserPluginButtonHash: buttonHash,
            };

            if (taskId !== null) {
                data.taskId = Number(taskId);
            }

            this.call({
                url: pathService.getStartUrl(),
                method: METHOD_POST,
                apiToken: token,
                payload: data,
                queryStringParams: { service: service },
            })
                .then((response) => {
                    let responseData = JSON.parse(response.response);
                    resolve(this.mapV3TimerStartToLegacy(responseData));
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response)
                });
        }
        );
    }

    addEntry(
        title,
        externalTaskId,
        buttonHash,
        billable,
        date,
        startTime,
        endTime,
        taskId = null,
        service = this.defaultServiceName
    ) {

        return this.authorizeAndCall((token, resolve, reject) => {
            let data = {
                date: date,
                startTime: startTime,
                endTime: endTime,
                description: title,
                externalTaskId: externalTaskId,
                billable: Boolean(billable),
                service: service,
            };

            if (taskId !== null) {
                data.taskId = Number(taskId);
            }

            this.call({
                url: pathService.getAddEntryUrl(),
                method: METHOD_POST,
                apiToken: token,
                payload: data,
            })
                .then((response) => {
                    let responseData = JSON.parse(response.response);
                    resolve({ entry_id: responseData.data.id });
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response)
                });
        }
        );
    }

    stop(service = this.defaultServiceName) {
        return this.authorizeAndCall((token, resolve, reject) => {
            this.call({
                url: pathService.getStopUrl(),
                method: METHOD_POST,
                apiToken: token,
                payload: {},
                queryStringParams: { service: service },
            })
                .then((response) => {
                    let responseData = JSON.parse(response.response);
                    resolve(this.mapV3TimerStopToLegacy(responseData));
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response);
                });
        }
        );
    }

    editEntry(
        entryId,
        billable = null,
        note = null,
        taskId = null,
        service = this.defaultServiceName
    ) {
        return this.authorizeAndCall((token, resolve, reject) => {
            let data = {};

            if (billable !== null) {
                data.billable = billable;
            }

            if (note !== null) {
                data.note = note;
            }

            if (taskId !== null) {
                data.taskId = Number(taskId);
            }

            this.call({
                url: pathService.getEditEntryUrl(entryId),
                method: METHOD_PUT,
                apiToken: token,
                payload: data,
                queryStringParams: { service: service },
            })
                .then((response) => {
                    resolve(JSON.parse(response.response).data);
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response)
                });
        }
        );
    }

    mapV3TimerStatusToLegacy(response) {
        const timer = response.timer || {};
        const entry = response.entry || {};
        const task = response.task || {};
        const presentation = response.presentation || {};

        return {
            isTimerRunning: Boolean(timer.isRunning),
            elapsed: timer.elapsed || 0,
            timer_id: timer.id,
            entry_id: entry.id,
            start_time: timer.startedAt,
            browser_plugin_button_hash: timer.browserPluginButtonHash,
            task_id: task.id,
            name: task.name,
            external_task_id: task.externalTaskId,
            billable: task.billable,
            note: entry.note,
            color: presentation.color,
            breadcrumb: presentation.breadcrumb,
        };
    }

    mapV3TimerStartToLegacy(response) {
        const timer = response.timer || {};
        const entry = response.entry || {};
        const task = response.task || {};

        return {
            new_timer_id: timer.id,
            timer_id: timer.id,
            entry_id: entry.id,
            stopped_timer: timer.stoppedTimerId,
            elapsed: timer.elapsed,
            name: task.name || '',
            external_task_id: task.externalTaskId,
            note: entry.note,
        };
    }

    mapV3TimerStopToLegacy(response) {
        const timer = response.timer || {};
        const entry = response.entry || {};

        return {
            elapsed: timer.elapsed || 0,
            entry_id: entry.id,
        };
    }

    discovery() {
        return this.authorizeAndCall((token, resolve, reject) => {
            this.call({
                url: pathService.getDiscoveryUrl(),
                method: METHOD_GET,
                apiToken: token,
            }, false)
                .then((response) => {
                    let responseData = JSON.parse(response.response);
                    resolve(responseData);
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response);
                });
        });
    }
    me() {
        return this.authorizeAndCall((token, resolve, reject) => {
            this.call({
                url: pathService.getMeUrl(),
                method: METHOD_GET,
                apiToken: token,
            })
                .then((response) => {
                    let responseData = JSON.parse(response.response);
                    resolve(responseData);
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response);
                });
        }
        );
    }

    getGroupSetting(
        name,
        groupId,
        service = this.defaultServiceName
    ) {
        return this.authorizeAndCall((token, resolve, reject) => {
            let data = {
                service: service,
            };

            this.call({
                url: pathService.getSettingUrl(groupId, name),
                method: METHOD_GET,
                apiToken: token,
                payload: data,
            })
                .then((response) => {
                    let responseData = JSON.parse(response.response);
                    resolve(responseData);
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response)
                });
        }
        );
    }

    getUserSetting(
        name,
        userId,
        timestamp,
        service = this.defaultServiceName
    ) {
        return this.authorizeAndCall((token, resolve, reject) => {
            let data = {
                service: service,
            };
            const path = pathService.getUserSettingUrl(userId) + '?name=' + name + "&timestamp=" + (timestamp ? "true" : "false");
            this.call({
                url: path,
                method: METHOD_GET,
                apiToken: token,
                payload: data,
            })
                .then((response) => {
                    let responseData = JSON.parse(response.response);
                    resolve(responseData);
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response)
                });
        }
        );
    }

    saveUserSetting(
        name,
        userId,
        value,
        service = this.defaultServiceName
    ) {
        return this.authorizeAndCall((token, resolve, reject) => {
            let data = {
                service: service,
                name: name,
                value: value
            };
            let path = pathService.getUserSettingUrl(userId);
            this.call({
                url: path,
                method: METHOD_PUT,
                apiToken: token,
                payload: data,
            })
                .then((response) => {
                    let responseData = JSON.parse(response.response);
                    resolve(responseData);
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response)
                });
        }
        );
    }

    getTagLists(
        tags,
        archived,
        useRestrictions,
        taskId,
        sortedArray,
        service = this.defaultServiceName
    ) {
        return this.authorizeAndCall((token, resolve, reject) => {
            let data = {
                service: service,
            };
            this.call({
                url: pathService.getTagListsUrl(
                    tags,
                    archived,
                    useRestrictions,
                    taskId,
                    sortedArray
                ),
                method: METHOD_GET,
                apiToken: token,
                payload: data,
            })
                .then((response) => {
                    let responseData = JSON.parse(response.response);
                    resolve(responseData);
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response)
                });
        }
        );
    }
    getUsers() {
        return this.authorizeAndCall((token, resolve, reject) => {
            this.call({
                url: pathService.getUsersUrl(),
                method: METHOD_GET,
                apiToken: token,
            })
                .then((response) => {
                    const responseData = JSON.parse(response.response);
                    resolve(responseData);
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response)
                });
            }
        );
    }
    initDetailedReport(dateFrom, dateTo){
        const DETAILED_REPORT_TYPE = 'DETAILED';
        return this.authorizeAndCall((token, resolve, reject) => {
            this.call({
                url: pathService.getReportDetailedUrl(),
                method: METHOD_POST,
                apiToken: token,
                payload: {
                    "type": DETAILED_REPORT_TYPE,
                    "timeFrameStart": dateFrom,
                    "timeFrameEnd": dateTo,
                    "archived": null
                }
            })
                .then((response) => {
                    const responseData = JSON.parse(response.response);
                    resolve(responseData);
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response)
                });
            }
        )
    }
    getReportStatus(id){
        return this.authorizeAndCall((token, resolve, reject) => {
            this.call({
                url: pathService.getReportsStatusUrl(id),
                method: METHOD_GET,
                apiToken: token,
            })
                .then((response) => {
                    const responseData = JSON.parse(response.response);
                    resolve(responseData);
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response)
                });
            }
        )
    }
    getReportResult(id){
        return this.authorizeAndCall((token, resolve, reject) => {
            this.call({
                url: pathService.getReportsResultUrl(id),
                method: METHOD_GET,
                apiToken: token,
            })
                .then((response) => {
                    const responseData = JSON.parse(response.response);
                    resolve(responseData);
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response)
                });
            }
        )
    }
    getRecentlyUsed(
        service = this.defaultServiceName
    ) {
        return this.authorizeAndCall((token, resolve, reject) => {
            let data = {
                service: service,
            };
            this.call({
                url: pathService.getRecentlyUsedUrl(),
                method: METHOD_GET,
                apiToken: token,
                payload: data,
            })
                .then((response) => {
                    let responseData = JSON.parse(response.response);
                    resolve(responseData);
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response)
                });
        }
        );
    }

    getFeatureFlag(
        rootGroupId,
        feature,
        service = this.defaultServiceName
    ) {
        return this.authorizeAndCall((token, resolve, reject) => {
            this.call({
                url: pathService.getFeatureFlagUrl(),
                method: METHOD_GET,
                apiToken: token,
                queryStringParams: {
                    feature: feature,
                    group: rootGroupId,
                    service: service,
                }
            })
                .then((response) => {
                    let responseData = JSON.parse(response.response);
                    resolve(responseData);
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response)
                });
        }
        );
    }

    hasBackendIntegrationEnabled(
        integration,
        service = this.defaultServiceName
    ) {
        return this.authorizeAndCall((token, resolve, reject) => {
            this.call({
                url: pathService.hasIntegration(),
                method: METHOD_GET,
                apiToken: token,
                queryStringParams: {
                    integration: integration,
                    service: service,
                }
            })
                .then((response) => {
                    let responseData = JSON.parse(response.response);
                    resolve(responseData);
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response)
                });
        }
        );
    }

    ping() {
        return new Promise((resolve, reject) => {
            this.call({
                url: pathService.getBaseUrl(),
                method: METHOD_GET,
            }).then((response) => {
                resolve(response);
            }).catch((response) => {
                logger.error(response);
                reject(response)
            });
        });
    }

    getFullTaskTree(
        service = this.defaultServiceName
    ) {
        return this.authorizeAndCall((token, resolve, reject) => {
            let data = {
                service: service,
            };
            this.call({
                url: pathService.getTasksUrl(),
                method: METHOD_GET,
                apiToken: token,
                payload: data,
                queryStringParams: {
                    ignoreAdminRights: true,
                    perms: 'track_time',
                }
            })
                .then((response) => {
                    let responseData = JSON.parse(response.response);
                    resolve(responseData);
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response)
                });
        }
        );
    }

    getTaskSearchedByText(
        searchText,
        rootGroupId
    ) {
        return this.authorizeNextAndCall((token, resolve, reject) => {
            if (token.next_token) {
                token = token.next_token;
            }
            this.call({
                url: pathService.getGraphQlUrl(),
                method: METHOD_POST,
                apiToken: token,
                payload: {
                    "query": "query " +
                        "SearchTasks($phrase:String!, $input: PaginatedTaskInput!, $order: OrderFieldSpecification) { " +
                        "search { " +
                        "getTasksByTaskPath(phrase: $phrase, input: $input, order: $order) { " +
                        "nextPage itemIdsContainingPhrase " +
                        "items {id\n name\n parentId\n}\n}\n}\n}\n",
                    "variables": {
                        "phrase": "" + searchText + "",
                        "input": { "workspaceId": rootGroupId },
                        "order": { "field": "name" }
                    },
                    "operationName": "SearchTasks"
                }
            })
                .then((response) => {
                    let responseData = JSON.parse(response.response);
                    resolve(responseData);
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response)
                });
        }
        );
    }

    assignTagsToEntry(
        tagIds,
        entryId,
        service = this.defaultServiceName
    ) {
        return this.authorizeAndCall((token, resolve, reject) => {
            let data = {
                service: service,
                tags: tagIds.join(',')
            };

            this.call({
                url: pathService.getAssignTagsToEntryUrl(
                    entryId
                ),
                method: METHOD_PUT,
                apiToken: token,
                payload: data,
            })
                .then((response) => {
                    let responseData = JSON.parse(response.response);
                    resolve(responseData);
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response)
                });
        }
        );
    }

    obtainNewToken() {
        return new Promise((resolve, reject) => {
            this.call(
                {
                    url: pathService.getTokenUrl(),
                    method: METHOD_GET,
                    onError: function (xhr) {
                        let status = xhr.status;
                        let response = xhr.response;

                        reject({
                            'status': status,
                            'response': response
                        });
                    }
                }

            )
                .then(async (response) => {
                    let status = response.status;
                    let responseData = JSON.parse(response.response);
                    const message = (responseData.message || '').toString().toUpperCase();
                    const token = responseData.token ?? '';

                    if (status !== 200 || message === 'NO_SESSION') {
                        reject();
                    } else {
                        this.storeToken(token).then(() => {
                            resolve({
                                'status': status,
                                'response': token
                            });
                        });
                    }
                })
                .catch((response) => {
                    let status = response.status;
                    let responseData = response.response;

                    reject({
                        'status': status,
                        'response': responseData
                    });
                });

        });
    }

    obtainNewNextToken() {
        return new Promise((resolve, reject) => {
            this.getStoredToken().then((token => {
                this.call({
                    url: pathService.getOpenIdTokenUrl(),
                    method: METHOD_GET,
                    apiToken: token,

                    onError: function (xhr) {
                        let status = xhr.status;
                        let response = xhr.response;

                        reject({
                            'status': status,
                            'response': response
                        });
                    }
                }).then((response) => {
                    this.call({
                        url: pathService.getNextOpenIdTokenAuthUrl(),
                        method: METHOD_POST,
                        payload: { "type": "token", "idToken": JSON.parse(response.response).idToken }
                    }).then((response) => {
                        this.storeNextToken(JSON.parse(response.response).response.token).then(() => {
                            resolve({
                                'status': status,
                                'response': JSON.parse(response.response)
                            });
                        })
                    }).catch((response) => {
                        logger.error(response);
                        reject(response)
                    });
                }).catch((response) => {
                    logger.error(response);
                    reject(response)
                });
            }));
        });
    }

    removeStoredToken() {
        return this.storageManager.clear();
    };

    storeToken(token) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set({ 'token': token, 'removed': false }, function () {
                resolve();
                if (chrome.runtime.lastError) {
                    logger.error(chrome.runtime.lastError.message);
                }
            });
        });
    };

    storeNextToken(token) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set({ 'next_token': token, 'removed': false }, function () {
                resolve();
                if (chrome.runtime.lastError) {
                    logger.error(chrome.runtime.lastError.message);
                }
            });
        });
    };

    getStoredToken() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get('token', function (items) {
                var token = items['token'];
                if (token && !chrome.runtime.lastError) {
                    resolve(token);
                } else {
                    reject();
                }
            });
        });
    };

    getStoredNextToken() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get('next_token', function (items) {
                var token = items['next_token'];
                if (token && !chrome.runtime.lastError) {
                    resolve(token);
                } else {
                    reject();
                }
            });
        });
    };

    getLoggedOutFlag() {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get('removed', function (items) {
                if (chrome.runtime.lastError) {
                    reject();
                    return;
                }
                var removed = items['removed'];
                if (removed || Object.keys(items).length === 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    };

    getToken(forceApiCall) {
        return new Promise((resolve, reject) => {
            this.getStoredToken().then((token) => {
                resolve(token);
            }).catch(() => {
                this.getLoggedOutFlag().then((loggedOut) => {
                    if (!loggedOut || forceApiCall) {
                        this.obtainNewToken()
                            .then((response) => {
                                resolve(response.response);
                            })
                            .catch((response) => {
                                logger.error(response);
                                reject(response);
                            });
                    } else {
                        reject();
                    }
                });
            });
        });
    };

    getNextToken(forceApiCall) {
        return new Promise((resolve, reject) => {
            this.getStoredNextToken().then((token) => {
                resolve(token);
            }).catch(() => {
                this.getLoggedOutFlag().then((loggedOut) => {
                    if (!loggedOut || forceApiCall) {
                        this.obtainNewToken()
                            .then((response) => {
                                this.obtainNewNextToken().then((response) => {
                                    resolve(response.response.response.token);
                                }).catch((response) => {
                                    logger.error(response);
                                    reject(response);
                                });
                            })
                            .catch((response) => {
                                logger.error(response);
                                reject(response);
                            });
                    } else {
                        reject();
                    }
                });
            });
        });
    };

    logEvent(cid, eventCategory, eventAction){
        const SUFFIX = '_timecamp_plugin';
        eventCategory = eventCategory + SUFFIX;
        const endpoint = `${pathService.getAnalyticsUrl()}?v=1&t=event&ec=${eventCategory}&ea=${eventAction}&cid=${cid}&tid=${GOOGLE_ANALYTICS_ID}`;

        fetch(endpoint, {
            method: "POST"
        });
    }
}
