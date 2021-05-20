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

        if (typeof data.api_token === 'undefined') {
            data.api_token = this.ApiToken;
        }

        data.service = Service;

        apiAddress = restUrl;
        url = apiAddress + url;

        var params = {
            type: method,
            url: url,
            data: data,
            headers: {"Authorization": "Bearer " + this.ApiToken}
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
            var data = {action: 'status'};
            return ApiService.call('/timer', data, 'POST');
        },
        start: function (external_task_id, startedAt) {
            var data = {action: 'start', external_task_id: external_task_id};
            if (startedAt != null)
                data['started_at'] = startedAt;

            return ApiService.call('/timer', data, 'POST').fail(function(msg) {
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
            var data = {};
            if(timer_id)
                data.timer_id = timer_id;
            return ApiService.call('/timer', data, 'DELETE');
        },
        stop: function (stoppedAt){
            var data = {action: 'stop'};
            if(stoppedAt)
                data.stopped_at = stoppedAt;
            return ApiService.call('/timer', data, 'POST');
        }
    };

    this.Entries = new ApiResource('/entries', ["get","post", "put"]);
    this.me = new ApiResource('/me/service/chrome-plugin', ["get"]);
    this.getWrikeId = new ApiResource('/wrikeV3',["get"]);

    this.TagLists = new ApiResource('/tag_list', ["get"]);
}


