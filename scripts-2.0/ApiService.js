import PathService from './PathService';
import Logger from './Logger';
import browser from "webextension-polyfill";
import Response from "./Response";

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

    constructor() {
    }

    setSuitableDomain() {
        this.me().then((response) => {
            this.rootGroupId = parseInt(response.root_group_id);
            this.userId = parseInt(response.user_id);
            pathService.changeBaseUrlForRootGroup(this.rootGroupId);
        });
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

    call(opts, checkForCustomDomain = true) {
        if ((this.rootGroupId === null || this.userId === null) && checkForCustomDomain) {
            this.setSuitableDomain();
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
                .then(function (response) {
                    if (response.ok) {
                        return response.text();
                    }

                    throw response.text();
                })
                .then(function (text) {
                    resolve({ status: 200, response: text });
                })
                .catch(function (error) {
                    console.log({ status: 500, response: error });
                    resolve({ status: 500, response: error });
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
            let data = {
                action: 'status',
                service: service
            };

            this.call({
                url: pathService.getStatusUrl(),
                method: METHOD_POST,
                apiToken: token,
                payload: data,
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
                action: 'start',
                entry_id: 'create',
                note: title,
                external_task_id: externalTaskId,
                started_at: startedAt,
                browser_plugin_button_hash: buttonHash,
                service: service
            };

            if (taskId !== null) {
                data.task_id = taskId;
            }

            this.call({
                url: pathService.getStartUrl(),
                method: METHOD_POST,
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
                start_time: startTime,
                end_time: endTime,
                description: title,
                task_id: taskId,
                external_task_id: externalTaskId,
                browser_plugin_button_hash: buttonHash,
                service: service
            };

            if (taskId !== null) {
                data.task_id = taskId;
            }

            this.call({
                url: pathService.getAddEntryUrl(),
                method: METHOD_POST,
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

    stop(service = this.defaultServiceName) {
        return this.authorizeAndCall((token, resolve, reject) => {
            let data = {
                action: 'stop',
                service: service,
            };

            this.call({
                url: pathService.getStopUrl(),
                method: METHOD_POST,
                apiToken: token,
                payload: data,
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

    editEntry(
        entryId,
        billable = null,
        note = null,
        taskId = null,
        service = this.defaultServiceName
    ) {
        return this.authorizeAndCall((token, resolve, reject) => {
            let data = {
                id: entryId,
                service: service,
            };

            if (billable !== null) {
                data.billable = billable;
            }

            if (note !== null) {
                data.note = note;
            }

            if (taskId !== null) {
                data.task_id = taskId;
            }

            this.call({
                url: pathService.getEditEntryUrl(),
                method: METHOD_PUT,
                apiToken: token,
                payload: data,
            })
                .then((response) => {
                    resolve(JSON.parse(response.response));
                })
                .catch((response) => {
                    logger.error(response);
                    reject(response)
                });
        }
        );
    }

    me() {
        return this.authorizeAndCall((token, resolve, reject) => {
            this.call({
                url: pathService.getMeUrl(),
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
        console.log('executing obtainNewToken')
        return new Promise((resolve, reject) => {
            this.call(
                {
                    url: pathService.getTokenUrl(),
                    method: METHOD_GET,

                    onLoad: function (xhr) {
                        let status = xhr.status;
                        let response = xhr.response;

                        if (status !== 200 || response.toUpperCase() === 'NO_SESSION' || response.length > 50) {
                            reject();
                        } else {
                            this.storeToken(response).then(() => {
                                resolve({
                                    'status': status,
                                    'response': response
                                });
                            });
                        }
                    },

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
                .then((response) => {
                    let status = response.status;
                    let responseData = response.response;

                    if (status !== 200 || responseData.toUpperCase() === 'NO_SESSION' || responseData.length > 50) {
                        reject();
                    } else {
                        this.storeToken(responseData).then(() => {
                            resolve({
                                'status': status,
                                'response': responseData
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
        return new Promise((resolve, reject) => {
            chrome.storage.sync.clear();
            chrome.storage.sync.set({ 'removed': true }, function () {
                if (chrome.runtime.lastError) {
                    reject();
                } else {
                    resolve(true);
                }
            });
        });
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
