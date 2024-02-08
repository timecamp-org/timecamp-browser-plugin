import { TCTheme } from "../types/theme";
import StorageManager from "../StorageManager";

const browser = require('webextension-polyfill');

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
