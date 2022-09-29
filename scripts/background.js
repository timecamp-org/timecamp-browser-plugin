const SURVEY_URL = "https://forms.gle/dfhvjtahyjf9w8bWA"

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.id === "apiService") {
            $.ajax(request.params).success(function (data) {
                sendResponse({ resolve: true, data: data });
            }).error(function (xhr) {
                if (xhr.status && xhr.status === 403 && !request.isRetry) {
                    TokenManager.obtainNewToken().done(function (token) {
                        ApiService.setToken(token);
                        sendResponse({ resolve: false, data: { retry: request } });
                    }).fail(function () {
                        sendResponse({ resolve: false, data: xhr });
                    });
                } else {
                    sendResponse({ resolve: false, data: xhr });
                }
            });

            return true;
        }

        if (request.id === "errorLog") {
            $.ajax({
                url: serverUrl + "ajax/send_error_log",
                type: "post",
                contentType: 'application/json',
                dataType: 'json',
                data: JSON.stringify({ type: "chrome-plugin-start-timer", details: request.response })
            });

            return true;
        }

        if (request.id === "canTrack") {
            $.ajax(request.params).done(function (response) {
                sendResponse({ resolve: true, data: response });
            }).fail(function () {
                sendResponse({ resolve: false, data: null });
            });

            return true;
        }

        if (request.id === "token") {
            $.ajax({
                url: tokenUrl,
                data: request.params.data,
                type: 'POST'
            }).done(function (token) {
                if (token.toUpperCase() !== 'NO_SESSION' && token.length <= 50) {
                    TokenManager.storeToken(token);
                    chrome.runtime.sendMessage({
                        popup: {
                            loggedIn: null,
                            statusText: chrome.i18n.getMessage("STATUS_SUCCESS")
                        }
                    });
                    setTimeout(function () {
                        window.parent.close();
                    }, 3000);
                } else {
                    chrome.runtime.sendMessage({
                        popup: {
                            loggedIn: null,
                            statusText: chrome.i18n.getMessage("LOG_IN_ERROR"),
                            statusFlag: 'error'
                        }
                    });
                }
            }).fail(function () {
                chrome.runtime.sendMessage({
                    popup: {
                        loggedIn: null,
                        statusText: chrome.i18n.getMessage("LOG_IN_ERROR"),
                        statusFlag: 'error'
                    }
                });
            });
        }
    });

chrome.runtime.setUninstallURL(SURVEY_URL)