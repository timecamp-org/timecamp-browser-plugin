import { TCTheme } from "../types/theme";
import StorageManager from "../StorageManager";
// @ts-ignore
import tcLogo from "../../images/logoTC-with-name.svg";

// @ts-ignore
import tcLogoDark from "../../images/logoTC-with-name-dark.svg";

const browser = require('webextension-polyfill');

const LOGOS_BY_THEME = {
    default: tcLogo,
    darkmode: tcLogoDark,
  };

export const getTheme = (userId: number, callback) => {
    browser.runtime.sendMessage({
        type: "getTheme",
        userId: userId,
      })
      .then(({ value }) => {
        callback(value);
        storeThemeInStorage(value)
      })
      .catch(() => {});
  };   
  
  export const storeThemeInStorage = (theme: TCTheme) => {
      browser.runtime.sendMessage({
          type: 'saveSettingToStorage',
          name: StorageManager.TC_THEME,
          value: theme
      }).then(()=>{})
      .catch(()=>{})
  }

  export const retrieveThemeFromStorage = (callback) => {
      browser.runtime.sendMessage({
          type:'getSettingFromStorage',
          name: StorageManager.TC_THEME
      }).then((value)=>{
            callback(value)
      }).catch(()=>{

      })
  }

  

export const getLogoByTheme = (theme) =>{
    return LOGOS_BY_THEME[theme]
}