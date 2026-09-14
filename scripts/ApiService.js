/**
 * Created by mdybizbanski on 21.09.15.
 */
function ApiService() {

    ApiToken = null;

    var $this = this;

    this.setToken = function (token)
    {
        this.ApiToken = token;
    };

    this.call = function (url, data, method, isRetry) {
        var origParams = {url: url, data: data, method: method, isRetry: isRetry};
        if (url == undefined)
        {
            return $.Deferred(function (dfd)
            {
                if (ApiService.ApiToken == null)
                    dfd.reject({message:"not_logged_in"});
            });
        }

        if (!this.ApiToken)
        {
            return $.Deferred(function (dfd)
            {
                if (ApiService.ApiToken == null)
                    dfd.reject({message:"not_logged_in"});
            });
        }

        if (data == undefined)
            data = {};

        if (method == undefined)
            method = 'GET';
        else
            method = method.toUpperCase();

        var isV3Request = url.indexOf('/v3/') !== -1;
        if (!isV3Request)
            data.service = Service;

        apiAddress = isV3Request ? serverUrl + 'chrome_plugin/api' : restUrl;
        url = apiAddress + url;

        var params = {
            type: method,
            url: url,
            data: data,
            headers: {"Authorization": "Bearer " + this.ApiToken},
            json: isV3Request
        };

        switch (method) {
            case 'POST':
            case 'PUT':
            case 'DELETE':
                break;

            case 'GET':
                params.data.cachekill = new Date().getTime();
                break;
        }

        return $.Deferred(function (dfd)
        {
            chrome.runtime.sendMessage(
                {
                    id: "apiService",
                    origParams: origParams,
                    params: params,
                    isRetry: isRetry
                },
                function(response) {
                    if (typeof response !== "undefined") {
                        if (typeof response.resolve !== "undefined" && response.resolve === true) {
                            dfd.resolve(response.data);
                        } else {
                            if(response.data && response.data.retry) {
                               ApiService.call(
                                   response.data.retry.origParams.url,
                                   response.data.retry.origParams.data,
                                   response.data.retry.origParams.method,
                                   true
                               ).then(function (data) {
                                   dfd.resolve(data);
                               }).fail(function (data) {
                                   dfd.reject(data);
                               });
                            } else {
                                dfd.reject(response.data);
                            }
                        }
                    } else {
                        dfd.reject(response);
                    }
                }
            );
        });
    };

    /**
     * Constructor for default api interface for resource
     * @param resource string
     * @param methods string[], default = ['get','delete','post','put']
     * @returns {{}} Object containing api methods.
     */
    function ApiResource(resource, methods)
    {
        var reg = /{[0-9]+}/g;
        var resourceParams = resource.match(reg);

        if (methods == undefined) {
            methods = ['get', 'delete', 'post', 'put'];
        }

        var res = this;

        $.each(methods, function (key, method) {
            res[method] = function ()
            {
                var args = Array.prototype.slice.call(arguments);
                var data = undefined;
                var paramOffset = 0;
                if(resourceParams)
                {
                    for (var i = 0; i < arguments.length; i++)
                    {
                        var arg = arguments[i];
                        if(angular.isObject(arg)){
                            paramOffset = i;
                            break;
                        }
                    }
                    if(i == arguments.length){
                        paramOffset = i;
                    }
                }
                if(arguments.length >= paramOffset + 1)
                    data = args[paramOffset];

                var params = args.slice(0, paramOffset);
                params.unshift(resource);
                var theResource = String.format.apply(this, params);
                return $this.call(theResource, data, method);
            }
        });
        return this;
    }

    this.Timer = {
        status: function () {
            return ApiService.call(
                '/v3/timer/status?service=' + encodeURIComponent(Service),
                {},
                'GET'
            ).then(mapV3TimerStatusToLegacy);
        },
        start: function (external_task_id, startedAt) {
            var data = {entryId: 'create', externalTaskId: external_task_id};
            if (startedAt != null)
                data.startedAt = startedAt;

            return ApiService.call(
                '/v3/timer/start?service=' + encodeURIComponent(Service),
                data,
                'POST'
            ).then(mapV3TimerStartToLegacy).fail(function(msg) {
                function formatTextForErrorNotice(formatedResponseText) {

                    if (formatedResponseText.charAt(0) != '{') formatedResponseText = formatedResponseText.replace(/\s/g, '');
                    formatedResponseText = formatedResponseText.split("body").pop();
                    formatedResponseText = formatedResponseText.split("js-body").pop();
                    return formatedResponseText;
                }
                var formatedResponseText = formatTextForErrorNotice(msg.responseText || msg.statusText);
                var response = ApiService.ApiToken + " :: " + external_task_id + " - " + msg.status + " - " + formatedResponseText;

                if(msg.status == 0) {
                    alert( "Sorry, something went wrong. Please try reinstalling TimeCamp Chrome Plugin or send us this information to support@timecamp.com (screenshot or full text): \r\n" +
                        response);
                } else {
                    alert( "Sorry, something went wrong. Please try again later or send us this information to support@timecamp.com (screenshot or full text): \r\n" +
                        response);
                }

                if(response.indexOf("authentication") == -1 && formatedResponseText.charAt(0) != '{') {
                    chrome.runtime.sendMessage(
                        {
                            id: "errorLog",
                            response: response
                        }
                    );
                }
            });
        },
        cancel: function (timer_id){
            var query = '?service=' + encodeURIComponent(Service);
            if(timer_id)
                query += '&timerId=' + encodeURIComponent(timer_id);
            return ApiService.call('/v3/timer' + query, {}, 'DELETE');
        },
        stop: function (stoppedAt){
            var data = {};
            if(stoppedAt)
                data.stoppedAt = stoppedAt;
            return ApiService.call(
                '/v3/timer/stop?service=' + encodeURIComponent(Service),
                data,
                'POST'
            ).then(mapV3TimerStopToLegacy);
        }
    };

    this.Entries = {
        get: function (params) {
            params = params || {};
            var externalTaskIds = String(params.external_task_id || '')
                .split(',')
                .filter(Boolean);
            var taskRequests = externalTaskIds.map(function (externalTaskId) {
                return ApiService.call('/tasks', {
                    external_task_id: externalTaskId,
                    service: Service
                }, 'GET').then(function (task) {
                    return task.task_id;
                });
            });

            return Promise.all(taskRequests).then(function (taskIds) {
                taskIds = taskIds.filter(Boolean);
                if (externalTaskIds.length && !taskIds.length)
                    return [];

                var data = {
                    startDate: params.from,
                    endDate: params.to,
                    userIds: params.user_ids ? String(params.user_ids).split(',').filter(Boolean) : undefined,
                    taskIds: taskIds.map(String),
                    withSubtasks: Boolean(params.with_subtasks),
                    useLegacyDefaultUserScope: true
                };

                return ApiService.call('/v3/time-entries/list', data, 'POST').then(function (entries) {
                    return entries
                        .filter(function (entry) {
                            return !externalTaskIds.length || externalTaskIds.some(function (externalTaskId) {
                                return matchesExternalTaskId(entry.addons_external_id, externalTaskId, Service);
                            });
                        })
                        .map(mapV3EntryToLegacy);
                });
            });
        },
        post: function (data) {
            data = data || {};
            var payload = {
                service: Service,
                date: data.date,
                duration: data.duration,
                startTime: data.start_time,
                endTime: data.end_time,
                taskId: data.task_id == null ? undefined : Number(data.task_id),
                externalTaskId: data.external_task_id,
                note: data.note,
                description: data.description,
                billable: data.billable == null ? undefined : Boolean(Number(data.billable)),
                tags: data.tags
            };
            return ApiService.call('/v3/time-entries/create', payload, 'POST').then(function (response) {
                return {entry_id: response.data.id};
            });
        },
        put: function (data) {
            data = data || {};
            var entryId = data.id;
            var payload = {
                date: data.date,
                startTime: data.start_time,
                endTime: data.end_time,
                duration: data.duration == null ? undefined : Number(data.duration),
                note: data.note,
                description: data.description,
                billable: data.billable == null ? undefined : Boolean(Number(data.billable)),
                taskId: data.task_id == null ? undefined : Number(data.task_id)
            };
            return ApiService.call(
                '/v3/time-entries/' + encodeURIComponent(entryId) + '?service=' + encodeURIComponent(Service),
                payload,
                'PUT'
            ).then(function (response) {
                return response.data;
            });
        }
    };
    this.me = new ApiResource('/me/service/chrome-plugin', ["get"]);
    this.getWrikeId = new ApiResource('/wrikeV3',["get"]);

    this.TagLists = new ApiResource('/tag_list', ["get"]);

    function mapV3TimerStatusToLegacy(response) {
        var timer = response.timer || {};
        var entry = response.entry || {};
        var task = response.task || {};
        var presentation = response.presentation || {};

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
            breadcrumb: presentation.breadcrumb
        };
    }

    function mapV3TimerStartToLegacy(response) {
        var timer = response.timer || {};
        var entry = response.entry || {};
        var task = response.task || {};

        return {
            new_timer_id: timer.id,
            timer_id: timer.id,
            entry_id: entry.id,
            stopped_timer: timer.stoppedTimerId,
            elapsed: timer.elapsed,
            name: task.name || '',
            external_task_id: task.externalTaskId,
            note: entry.note
        };
    }

    function mapV3TimerStopToLegacy(response) {
        return {
            elapsed: response.timer && response.timer.elapsed || 0,
            entry_id: response.entry && response.entry.id
        };
    }

    function mapV3EntryToLegacy(entry) {
        var task = entry.task || {};
        var user = entry.user || {};

        return {
            id: entry.id,
            duration: String(entry.duration),
            user_id: String(user.id || ''),
            user_name: user.display_name || user.email || '',
            task_id: String(task.id || ''),
            task_note: task.note || '',
            last_modify: entry.last_modify || '',
            date: entry.date,
            start_time: entry.start_time,
            end_time: entry.end_time || '',
            locked: String(entry.locked || 0),
            name: task.name || '',
            addons_external_id: entry.addons_external_id || '',
            billable: entry.billable ? 1 : 0,
            invoiceId: String(entry.invoice_id || ''),
            color: task.color || '',
            description: entry.description || ''
        };
    }

    function matchesExternalTaskId(value, requestedId, service) {
        if (value === requestedId)
            return true;

        var prefixes = {
            trello: 'card_',
            asana: 'asana_',
            activecollab: 'activecollab_',
            podio: 'podio_',
            zendesk: 'zendesk_',
            teamwork: 'teamwork_',
            insightly: 'insightly_',
            todoist: 'todoist_',
            wrike: 'wrike_task_'
        };
        var prefix = prefixes[String(service || '').toLowerCase()] || '';

        return value === prefix + requestedId;
    }
}
