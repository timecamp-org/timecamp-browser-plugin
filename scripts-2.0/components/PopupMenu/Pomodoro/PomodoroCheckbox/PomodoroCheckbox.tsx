import * as React from "react";
import "./styles.scss";
export interface PomodoroCheckboxProps {
  isChecked: boolean;
  onClick?: () => void;
}

const PomodoroCheckbox: React.FC<PomodoroCheckboxProps> = (props) => {
  return (
    <label
      className="pomodoro-checkbox"
      data-ischecked={props.isChecked ? "true" : "false"}
    >
      <svg
        className="pomodoro-checkbox__svg"
        width="10"
        height="10"
        viewBox="0 0 10 11"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d="M12.1463 0.147551L4.74818 7.54566L2.02985 4.82733C1.89805 4.69553 1.68436 4.69553 1.55254 4.82733L0.757048 5.62281C0.625255 5.75461 0.625255 5.9683 0.757048 6.10012L4.50951 9.85259C4.64131 9.98438 4.855 9.98438 4.98682 9.85259L13.4191 1.42035C13.5509 1.28855 13.5509 1.07486 13.4191 0.943039L12.6236 0.147551C12.4918 0.0157576 12.2781 0.0157576 12.1463 0.147551Z"
          fill={"rgb(255,255,255)"}
        />
      </svg>
      <input
        type="checkbox"
        checked={props.isChecked}
        onClick={props.onClick}
      />
    </label>
  );
};

export default PomodoroCheckbox;
