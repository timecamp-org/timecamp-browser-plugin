import browser from 'webextension-polyfill';
import { useState, useEffect } from 'react';
import {IUseTheme} from "./useTheme.types";
import {Theme} from "../../types/theme";

export const useTheme = (): IUseTheme => {
    const [theme, setTheme] = useState<Theme>('default');

    useEffect(() => {
        browser.runtime.sendMessage({
            type: 'getTheme',
        }).then((value) => {
            setTheme(value);
        }).catch(() => {});
    }, []);

    return theme;
}