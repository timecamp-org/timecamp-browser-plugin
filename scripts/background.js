const objectToFormdata = (obj) => {
  const data = new URLSearchParams();
  for (const [key, value] of Object.entries(obj)) {
    data.append(key, value);
  }
  return data.toString();
};
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.id === "apiService") {
    const { data, headers, type, url, json } = request.params;
    let requestUrl = url;
    const params = {
      method: type,
      headers: {
        ...headers,
        Accept: "application/json",
        "content-type": json ? "application/json" : "application/x-www-form-urlencoded",
      },
    };
    if (type !== "GET" && type !== "HEAD") {
      params.body = json ? JSON.stringify(data) : objectToFormdata(data);
    } else if (data && Object.keys(data).length) {
      const query = objectToFormdata(data);
      requestUrl += (requestUrl.includes("?") ? "&" : "?") + query;
    }
    fetch(requestUrl, params)
      .then(async (response) => {
        const data = response.status === 204 ? null : await response.json();
        if (!response.ok) {
          throw {
            status: response.status,
            statusText: response.statusText,
            responseText: typeof data === "string" ? data : JSON.stringify(data),
          };
        }

        return data;
      })
      .then((data) => sendResponse({ resolve: true, data: data }))
      .catch((error) => {
        if (error.status && error.status === 403 && !request.isRetry) {
          TokenManager.obtainNewToken()
            .then((token) => {
              ApiService.setToken(token);
              sendResponse({ resolve: false, data: { retry: request } });
            })
            .catch(() => {
              sendResponse({ resolve: false, data: error });
            });
        } else {
          sendResponse({ resolve: false, data: error });
        }
      });
    return true;
  }

  if (request.id === "errorLog") {
    fetch(serverUrl + "ajax/send_error_log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "chrome-plugin-start-timer",
        details: request.response,
      }),
    });
    return true;
  }

  if (request.id === "canTrack") {
    const { data, headers, type, url } = request.params;
    const params = {
      method: type,
      headers: {
        ...headers,
        Accept: "application/json",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: objectToFormdata(data),
    };
    fetch(url, params)
      .then((response) => {
        sendResponse({ resolve: true, data: response });
      })
      .catch(() => {
        sendResponse({ resolve: false, data: null });
      });
    return true;
  }

  if (request.id === "token") {
    fetch(tokenUrl, {
      method: "POST",
      body: request.params.data,
    })
      .then((response) => response.text())
      .then((token) => {
        if (token.toUpperCase() !== "NO_SESSION" && token.length <= 50) {
          TokenManager.storeToken(token);
          chrome.runtime.sendMessage({
            popup: {
              loggedIn: null,
              statusText: chrome.i18n.getMessage("STATUS_SUCCESS"),
            },
          });
          setTimeout(() => {
            window.parent.close();
          }, 3000);
        } else {
          chrome.runtime.sendMessage({
            popup: {
              loggedIn: null,
              statusText: chrome.i18n.getMessage("LOG_IN_ERROR"),
              statusFlag: "error",
            },
          });
        }
      })
      .catch(() => {
        chrome.runtime.sendMessage({
          popup: {
            loggedIn: null,
            statusText: chrome.i18n.getMessage("LOG_IN_ERROR"),
            statusFlag: "error",
          },
        });
      });
  }
});
