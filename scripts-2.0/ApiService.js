import PathService from './PathService';
import Logger from './Logger';

const pathService = new PathService();
const logger = new Logger();

const METHOD_GET = 'GET';
const METHOD_POST = 'POST';
const METHOD_PUT = 'PUT';

export default class ApiService {
    defaultServiceName = 'ChromePlugin';
    rootGroupId = null;
    userId = null;

    constructor () {
    }

    setSuitableDomain() {
        this.me().then((response) => {
            this.rootGroupId = parseInt(response.root_group_id);
            this.userId = parseInt(response.user_id);
            pathService.changeBaseUrlForRootGroup(this.rootGroupId);
        });
    }

    call(opts, checkForCustomDomain = true) {
        if ((this.rootGroupId === null || this.userId === null ) && checkForCustomDomain) {
            this.setSuitableDomain();
        }

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const method = opts.method || METHOD_GET;
            const apiToken = opts.apiToken;
            let url = opts.url;

            if (opts.queryStringParams) {
                let queryStringParams = new URLSearchParams(opts.queryStringParams).toString();
                url = url + '?' + queryStringParams
            }

            logger.log('Request:')
            logger.table(opts);

            xhr.open(method, url, true);

            if (opts.contentType) {
                xhr.setRequestHeader('content-type', opts.contentType);
            } else {
                xhr.setRequestHeader('content-type', 'application/json');
            }

            if (opts.accept) {
                xhr.setRequestHeader('accept', opts.accept);
            } else {
                xhr.setRequestHeader('accept', 'application/json');
            }

            if (apiToken) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + apiToken);
            }

            xhr.onload = () => {
                logger.log('Response (onload):')
                logger.table({
                    status: xhr.status,
                    response: xhr.response,
                });

                resolve({
                    status: xhr.status,
                    response: xhr.response
                });
            };

            xhr.onerror = () => {
                logger.log('Response (onerror):')
                logger.table({
                    status: xhr.status,
                    response: xhr.response,
                });

                reject({
                    status: xhr.status,
                    response: xhr.response
                });
            };

            let body;
            if (opts.bodyAsQueryString === true) {
                let payload = opts.payload;
                body = Object.keys(payload).map(key => key + '=' + encodeURIComponent(payload[key])).join('&')
            } else {
                body = JSON.stringify(opts.payload);
            }

            xhr.send(body);
        });
    }

    authorizeAndCall(callback) {
        return new Promise((resolve, reject) => {
            this.getToken()
                .then((token)=>{
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
                .then((token)=>{
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
        startedAt,
        taskId = null,
        service = this.defaultServiceName
    ) {

        return this.authorizeAndCall((token, resolve, reject) => {
            let data = {
                action: 'start',
                entry_id: 'create',
                external_task_name: title,
                external_task_id: externalTaskId,
                started_at: startedAt,
                service: service,
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
                        "query":"query " +
                            "SearchTasks($phrase:String!, $input: PaginatedTaskInput!, $order: OrderFieldSpecification) { " +
                                "search { " +
                                    "getTasksByTaskPath(phrase: $phrase, input: $input, order: $order) { " +
                                    "nextPage itemIdsContainingPhrase " +
                                    "items {id\n name\n parentId\n}\n}\n}\n}\n",
                                "variables": {
                                    "phrase":"" + searchText + "",
                                    "input":{"workspaceId":rootGroupId},
                                    "order":{"field":"name"}
                                },
                                "operationName":"SearchTasks"
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


    logIn(login, password) {
        return new Promise((resolve, reject) => {
            this.call({
                url: pathService.getLoginUrl(),
                method: METHOD_POST,
                payload: {
                    email: login,
                    pass_hash: password,
                    dont_log_out: true,
                },
                bodyAsQueryString: true,
                contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
            }, false).then((response) => {
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
            }).catch((response) => {
                let status = response.status;
                let responseData = response.response;

                reject({
                    'status': status,
                    'response': responseData
                });
            });
        });
    }

    obtainNewToken() {
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
                        payload: {"type":"token", "idToken": JSON.parse(response.response).idToken }
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
            chrome.storage.sync.set({ 'token': token , 'removed' : false}, function () {
                resolve();
                if (chrome.runtime.lastError) {
                    logger.error(chrome.runtime.lastError.message);
                }
            });
        });
    };

    storeNextToken(token) {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set({ 'next_token': token , 'removed' : false}, function () {
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
                                resolve(response);
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
}
