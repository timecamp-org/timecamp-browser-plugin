import * as React from "react";
import translate from "../../../Translator.js";
import Button from "../../common/Button/";
import "./styles.scss";
import PathService from "../../../PathService.js";

// @ts-ignore
import ShutdownIconSVG from "../../../icons/shutdown-icon.svg";

const serverUrl = new PathService().getBaseUrl();

const UserPopup = ({
  setIsUserWindowOpen,
  isUserWindowOpen,
  user,
  logoutCallback,
}) => {
  const node = React.useRef<HTMLDivElement>(null);
  const wrapperClassName = `tc-popup-header__user-slide-window  ${isUserWindowOpen ? "tc-popup-header__user-slide-window--visible" : ""}`;

  React.useEffect(() => {
    document.addEventListener("click", onClickOutside);

    return () => {
      document.removeEventListener("click", onClickOutside);
    };
  }, [setIsUserWindowOpen]);

  const onClickOutside = (e) => {
    const shouldStayOpen =
      node.current !== null && node.current.contains(e.target);
    if (!shouldStayOpen) {
      setIsUserWindowOpen(false);
    }
  };

  return (
    <div className={wrapperClassName} ref={node}>
      <div>
        <div className="section-top">
          <a href={serverUrl + "app#/settings/users/me"} target="_blank">
            <div className="section-top__image">
              <img className="user__img user-img" src={user.gravatarUrl} />
            </div>
            <div className="section-top__user">
              <div
                className="section-top__user__display-name"
                style={user.displayName === null ? { marginTop: "10px" } : {}}
              >
                {user.displayName === null ? user.email : user.displayName}
              </div>
              {user.displayName && (
                <div className="section-top__user__email">{user.email}</div>
              )}
            </div>
          </a>
        </div>
        <a
          className="section-middle-timecamp"
          href={serverUrl}
          target="_blank"
          rel="noreferrer"
        >
          <img src={"images/icon-14.png"} alt="TimeCamp logo"></img>
          <span>TimeCamp Web</span>
        </a>

        <Button class={"section-bottom"} onClick={logoutCallback}>
          <img src={ShutdownIconSVG} alt="shutdown svg" />
          {translate("log_out")}
        </Button>
      </div>
    </div>
  );
};

export default UserPopup;
