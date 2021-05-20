/**
 * Created by mdybizbanski on 14.09.15.
 */

function TokenManager() {
    var $this = this;

    this.getLoggedOutFlag = function () {
        return $.Deferred(function (dfd) {
            chrome.storage.sync.get('removed', function (items) {
                if (chrome.runtime.lastError) {
                    dfd.reject();
                    return;
                }
                var removed = items['removed'];
                if (removed) {
                    dfd.resolve(true);
                } else {
                    dfd.resolve(false);
                }
            });
        });
    };

    this.getStoredToken = function () {
        return $.Deferred(function (dfd) {
            chrome.storage.sync.get('token', function (items) {
                var token = items['token'];
                if (token && !chrome.runtime.lastError) {
                    dfd.resolve(token);
                } else {
                    dfd.reject();
                }
            });
        });
    };

    this.storeToken = function (token) {
        chrome.storage.sync.set({ 'token': token , 'removed' : false}, function () {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError.message);
            }
        });
    };

    this.removeStoredToken = function () {
        return $.Deferred(function (dfd) {
            chrome.storage.sync.clear();
            chrome.storage.sync.set({ 'removed': true }, function () {
                if (chrome.runtime.lastError) {
                    dfd.reject();
                } else {
                    dfd.resolve(true);
                }
            });
        });
    };

    this.obtainNewToken = function() {
        return $.Deferred(function(dfd) {
            $.get(tokenUrl)
                .done(function (response) {
                    if (response.toUpperCase() === 'NO_SESSION' || response.length > 50) {
                        dfd.reject();
                    } else {
                        $this.storeToken(response);
                        dfd.resolve(response);
                    }
                })
                .fail(function () {
                    dfd.reject();
                });
        });
    };

    this.getToken = function (forceApiCall) {
        return $.Deferred(function (dfd) {
            $this.getStoredToken().done(function (token) {
                dfd.resolve(token);
            }).fail(function () {
                $this.getLoggedOutFlag().done(function (loggedOut) {
                    if (!loggedOut || forceApiCall) {
                        $this.obtainNewToken().done(function(response) {
                            dfd.resolve(response);
                        }).fail(function() {
                            dfd.reject()
                        });
                    } else {
                        dfd.reject();
                    }
                });
            });
        });
    };
}