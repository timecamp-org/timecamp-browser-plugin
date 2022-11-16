import * as React from "react";
import ReactDOM from 'react-dom';
import PopupMenu from "./components/PopupMenu";
import './StringExtensions';
const browser = require('webextension-polyfill');

window.$ = (s, elem) => {
    elem = elem || document;
    return elem.querySelector(s);
};

window.$$ = (s, elem) => {
    elem = elem || document;
    return elem.querySelectorAll(s);
};

document.addEventListener('DOMContentLoaded', () => {
    browser.runtime.sendMessage({
        action: 'track',
        type: "view"
    })
    Popup.render();
});

const Popup = {
    render: () => {
        const element = $('#popup-wrapper');
        ReactDOM.render(
            <PopupMenu />
            , element);
    }
}
