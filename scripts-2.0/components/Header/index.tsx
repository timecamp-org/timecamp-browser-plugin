import * as React from "react";
// @ts-ignore
import tcLogo from "../../../images/logoTC-with-name.svg";
// @ts-ignore
import tcLogoDark from "../../../images/logoTC-with-name-dark.svg";
import {useTheme} from "../../hooks/useTheme/useTheme";

import "./styles.scss";

export interface HeaderInterface {
  theme?: string;
}

const LOGOS_BY_THEME = {
  default: tcLogo,
  darkmode: tcLogoDark,
};

const Header: React.FC<HeaderInterface> = () => {

  const theme = useTheme();

  // @ts-ignore
  return (
    <div className={"header"}>
      <img
        className={"header__logo-svg"}
        src={LOGOS_BY_THEME[theme]}
        alt="TimeCamp logo"
      />
    </div>
  );
};

export default Header;
