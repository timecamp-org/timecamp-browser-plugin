'use strict';

//firefox helper for pass data from website to background script
window.addEventListener("message", (event) => {
    if (event.data.type === 'tokenUpdate') {
        browser.runtime.sendMessage(event.data);
    }
}, false);