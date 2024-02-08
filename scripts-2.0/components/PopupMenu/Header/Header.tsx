import * as React from "react";
// @ts-ignore
import tcLogo from "../../../../images/logoTC-with-name.svg";

// @ts-ignore
import AvatarIconSVG from "../../../icons/user-circle-fas.svg";
import { User } from "..";
import "./styles.scss";

import UserPopup from "./UserPopup";

export interface HeaderInterface {
  user: User;
  setIsUserWindowOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isUserWindowOpen: boolean;
  logoutCallback: () => void;
}

const Header: React.FC<HeaderInterface> = ({
  user,
  isUserWindowOpen,
  setIsUserWindowOpen,
  logoutCallback,
}) => {
  const handleClickUserAvatar = (e) => {
    if (isUserWindowOpen) return;

    setIsUserWindowOpen(true);
    e.stopPropagation();
  };

  return (
    <div className="tc-popup-header">
      <img
        className={"tc-popup-header__logo-svg"}
        src={tcLogo}
        alt="TimeCamp logo"
      />
      <div className="tc-popup-header__user-logo">
        <div
          className="tc-popup-header__user-logo__user-img"
          onClick={handleClickUserAvatar}
        >
          <img
            className="tc-popup-header__user-logo__user-img__avatar"
            src={user.gravatarUrl}
            data-status={isUserWindowOpen ? "active" : ""}
          />
        </div>
      </div>

      <UserPopup
        setIsUserWindowOpen={setIsUserWindowOpen}
        isUserWindowOpen={isUserWindowOpen}
        user={user}
        logoutCallback={logoutCallback}
      />
    </div>
  );
};

export default Header;
