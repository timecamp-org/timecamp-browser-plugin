import * as React from "react";
import { PomodoroTypes } from "../../../../helpers/pomodoro";

type FocusPhaseDropdownContentType = {
  onClick: (pomodoroType: PomodoroTypes) => void;
};

const FocusPhaseDropdownContent = React.forwardRef<
  HTMLUListElement,
  FocusPhaseDropdownContentType
>((props, ref) => {
  const { onClick } = props;

  return (
    <ul className="focus-phase-dropdown-content" ref={ref}>
      {Object.values(PomodoroTypes).map((focusPhase) => (
        <li
          value={focusPhase}
          key={focusPhase}
          onClick={() => {
            onClick(focusPhase);
          }}
        >
          <span>{focusPhase}</span>
        </li>
      ))}
    </ul>
  );
});

export default FocusPhaseDropdownContent;
