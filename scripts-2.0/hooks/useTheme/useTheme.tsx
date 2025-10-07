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
            switch (value) {
                case 'darkmode':
                case 'default':
                    setTheme(value);
                    break;
                case 'system':
                default:
                    setTheme(
                        window.matchMedia('(prefers-color-scheme: dark)').matches ? 'darkmode' : 'system'
                    );
            }
        }).catch(() => {});
    }, []);

    return theme;
}