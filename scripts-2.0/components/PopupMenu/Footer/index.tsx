import * as React from "react";
import { IconName } from "../../../icons/types";
import Icon from "../../Icon";
import Button from "../../common/Button";
import { User } from "../index";
import "./styles.scss";

import { ContextMenuType } from "../../ContextMenu/types";

import { PomodoroContext } from "../Pomodoro/PomodoroContext";
import PomodoroTypeSelector from "../Pomodoro/PomodoroTypeSelector";

export interface FooterInterface {
  logoutCallback: Function;
  onPlusButtonClickCallback: Function;
  user: User;
  onSetContextMenuType?: React.Dispatch<
    React.SetStateAction<ContextMenuType | undefined>
  >;
}

const Footer: React.FC<FooterInterface> = (props) => {
  const { onSetContextMenuType } = props;
  const {
    isPomodoroEnabled: [isPomodoroEnabled]
  } = React.useContext(PomodoroContext)

  return (
    <div className="tc-popup-footer">
      {isPomodoroEnabled ? (
        <div className="tc-popup-footer__button-focus">
          <PomodoroTypeSelector/>
        </div>
      ) : (
        <Button
          class={"tc-popup-footer__button-cancel"}
          onClick={() => onSetContextMenuType?.(ContextMenuType.ENTRY)}
        >
          <Icon name={IconName.PLUS} />
        </Button>
      )}

      <button
        className={"tc-popup-footer__button-add"}
        onClick={() => onSetContextMenuType?.(ContextMenuType.TIMER)}
      >
        <span>Start timer</span>
        <div className="tc-popup-footer__button-add__icon">
          <Icon name={IconName.PLAY} />
        </div>
      </button>
    </div>
  );
};

export default Footer;
