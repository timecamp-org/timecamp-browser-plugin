import * as React from "react";
import "./styles.scss";
import Button from "../../common/Button";
import Icon from "../../Icon";
import { IconName } from "../../../icons/types";
import { User } from "../index";
import translate from "../../../Translator";
import PathService from "../../../PathService";
import { ContextMenuType } from "../../ContextMenu/types";

export interface FooterInterface {
  logoutCallback: Function;
  onPlusButtonClickCallback: Function;
  user: User;
  onSetContextMenuType?: React.Dispatch<
    React.SetStateAction<ContextMenuType | undefined>
  >;
}

const serverUrl = new PathService().getBaseUrl();

const Footer: React.FC<FooterInterface> = (props) => {
  const { onSetContextMenuType } = props;
  return (
    <div className="tc-popup-footer">
      <div className="tc-popup-footer__button-anchor">
        <a
          className="tc-popup-footer__button-anchor__href"
          href={serverUrl + "app#/timesheets/graphical"}
          target="_blank"
        >
          <Icon name={IconName.EXTERNAL_LINK} iconPrefix={"fal"} />

          {translate("see_full_timesheet")}
        </a>
      </div>

      <Button
        class={"tc-popup-footer__button-cancel"}
        onClick={() => onSetContextMenuType?.(ContextMenuType.ENTRY)}
      >
        <Icon name={IconName.PLUS} />
      </Button>

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
