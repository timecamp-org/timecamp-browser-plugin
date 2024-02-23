import * as React from "react";
import { PomodoroDurationValues } from "..";
import { PomodoroTypes } from "../../../helpers/pomodoro";

export const initialPomodoroDurationsState = {
  pomodoroFocusPhase: "25:00",
  pomodoroShortBreak: "05:00",
  pomodoroLongBreak: "15:00",
};

export type UseStateContextType<T> = [
  T,
  React.Dispatch<React.SetStateAction<T>>,
];

export type PomodoroContextType = {
  type: UseStateContextType<PomodoroTypes>;
  pomodoroDurations: UseStateContextType<PomodoroDurationValues>;
  isPomodoroOptionsOpen: UseStateContextType<boolean>;
  isPomodoroEnabled: UseStateContextType<boolean>;
};

export const PomodoroContext = React.createContext<PomodoroContextType>({
  type: [PomodoroTypes.FOCUS_PHASE, () => {}],
  pomodoroDurations: [initialPomodoroDurationsState, () => {}],
  isPomodoroOptionsOpen: [false, () => {}],
  isPomodoroEnabled: [false, () => {}],
});
