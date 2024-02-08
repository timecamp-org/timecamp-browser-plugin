import * as React from "react";
import translate from "../../Translator";
import Button from "../common/Button";

import "./styles.scss";
import { IconName } from "../../icons/types";
import Icon from "../Icon";

export interface FooterInterface {
  onClickSave: any;
  onClickCancel: any;
  idDisabled?: boolean;
  showAddEntryButton?: boolean;
}

const Footer: React.FC<FooterInterface> = (props) => {
  const renderStartTimerButton = () => {
    return (
      <React.Fragment>
        <span>
          {" "}
          {translate("start_timer")}
          &nbsp;&nbsp;
        </span>
        <div>
          <Icon name={IconName.PLAY} />
          &nbsp;
        </div>
      </React.Fragment>
    );
  };

  const renderAddEntryButton = () => {
    return (
      <React.Fragment>
         {translate("add_time_entry")} 
      </React.Fragment>
    );
  };

  return (
    <div className={"footer"}>
      <div className={"footer__buttons"}>
        <Button class={"footer__button-cancel"} onClick={props.onClickCancel}>
          {translate("cancel")}
        </Button>

        <Button
          class={
            "footer__button-save" +
            (props.idDisabled ? " footer__button-disabled" : "")
          }
          onClick={!props.idDisabled ? props.onClickSave : () => {}}
        >
          {!props.showAddEntryButton && renderStartTimerButton()}
          {!!props.showAddEntryButton && renderAddEntryButton()}
        </Button>
      </div>
    </div>
  );
};

export default Footer;
