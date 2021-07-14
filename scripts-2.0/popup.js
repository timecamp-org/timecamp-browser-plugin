import * as React from "react";
import ReactDOM from 'react-dom';
import PopupMenu from "./components/PopupMenu";

window.$ = (s, elem) => {
    elem = elem || document;
    return elem.querySelector(s);
};

window.$$ = (s, elem) => {
    elem = elem || document;
    return elem.querySelectorAll(s);
};

document.addEventListener('DOMContentLoaded', () => {
    Popup.render();
});

const Popup = {
    render: () => {
        const element = $('#popup-wrapper');
        ReactDOM.render(
            <PopupMenu/>
        , element);
    }
}
