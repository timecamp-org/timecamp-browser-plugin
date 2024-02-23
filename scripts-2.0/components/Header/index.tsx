import * as React from "react";

import "./styles.scss";
import { getLogoByTheme } from "../../helpers/theme";

export interface HeaderInterface {
  theme?: string;
}

const Header: React.FC<HeaderInterface> = ({ theme = "default" }) => {
  
  return (
    <div className={"header"}>
      <img
        className={"header__logo-svg"}
        src={getLogoByTheme(theme)}
        alt="TimeCamp logo"
      />
    </div>
  );
};

export default Header;
