import * as React from "react";
import translate from "../../../Translator";

import DurationSelector from "../../DurationSelector/DurationSelector";
import SVGGearIcon from "./SVGGearIcon";
import "./styles.scss";

const browser = require("webextension-polyfill");

import StorageManager from "../../../StorageManager";
import PomodoroCheckbox from "./PomodoroCheckbox";
import { PomodoroContext } from "./PomodoroContext";
 

const Pomodoro = () => {
  const debouncedRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const debouncedValueRef = React.useRef<string>("");

  const {
    isPomodoroEnabled: [ isPomodoroEnabled, setIsPomodoroEnabled],
    isPomodoroOptionsOpen: [ isPomodoroOptionsOpen, setIsPomodoroOptionsOpen],
    pomodoroDurations: [ durationValues, setDurationValues]
  
  } = React.useContext(PomodoroContext)

  const onSetIsPomodoroEnabled = () => {
    const currentValue = !isPomodoroEnabled;

    browser.runtime.sendMessage({
      type: "saveSettingToStorage",
      name: StorageManager.POMODORO_IS_ENABLED,
      value: currentValue,
    });

    setIsPomodoroEnabled(currentValue);
  };  


  const toggleSetIsPomodoroOptionsOpen = () => {
    const newValue = !isPomodoroOptionsOpen;
    setIsPomodoroOptionsOpen(newValue);

    browser.runtime.sendMessage({
      type: "saveSettingToStorage",
      name: StorageManager.POMODORO_IS_OPTIONS_OPEN,
      value: newValue,
    });
  };

  const debounce = (value) => {
    debouncedValueRef.current = value;
    if (debouncedRef.current !== undefined) {
      clearTimeout(debouncedRef.current);
    }

    debouncedRef.current = setTimeout(() => {
      browser.runtime.sendMessage({
        type: "saveSettingToStorage",
        name: StorageManager.POMODORO_DURATION_VALUES,
        value: debouncedValueRef.current,
      });
    }, 300);
  };

  return (
    <div className="pomodoro">
      <div className="pomodoro__checkbox">
        <label>
          <p className="pomodoro__checkbox-paragraph">
            <PomodoroCheckbox
              isChecked={isPomodoroEnabled}
              onClick={onSetIsPomodoroEnabled}
            />
            <span className="pomodoro__checkbox-paragraph__label">Pomodoro mode </span>
          </p>
        </label>

        <div className="pomodoro__checkbox__svg-gear-icon">
          <SVGGearIcon
            isActive={isPomodoroOptionsOpen}
            onClick={toggleSetIsPomodoroOptionsOpen}
          />
        </div>
      </div>
      {isPomodoroOptionsOpen && (
        <React.Fragment>
          <div className="pomodoro__selectors">
            <div className="pomodoro__selectors__duration-selector">
              <DurationSelector
                label={translate("focus_phase")}
                value={durationValues.pomodoroFocusPhase}
                onChange={(e) => {  
                  setDurationValues(values=>({
                    ...values, 
                    pomodoroFocusPhase: e
                  }))

                  debounce(
                    JSON.stringify({
                      ...durationValues,
                      pomodoroFocusPhase: e,

                    }),
                  );
                }}
              />
            </div>
            <div className="pomodoro__selectors__duration-selector">
              <DurationSelector
                label={translate("short_break")}
                value={durationValues.pomodoroShortBreak}
                onChange={(e) => {                  
                  setDurationValues(values=>({
                    ...values,
                    pomodoroShortBreak:e
                  }))
                  
                  debounce(
                    JSON.stringify({
                      ...durationValues,
                      pomodoroShortBreak: e,
                    }),
                  );
                }}
              />
            </div>
            <div className="pomodoro__selectors__duration-selector">
              <DurationSelector
                label={translate("long_break")}
                value={durationValues.pomodoroLongBreak}
                onChange={(e) => {
                  
                  setDurationValues(values=>({
                    ...values,
                    pomodoroLongBreak: e
                  }))

                  debounce(
                    JSON.stringify({
                      ...durationValues,
                      pomodoroLongBreak: e,
                      
                    }),
                  );
                }}
              />
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default Pomodoro;
