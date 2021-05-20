import * as React from "react";
// @ts-ignore
import tcLogo from "../../../images/logoTC-with-name.svg";

import './styles.scss';

export interface HeaderInterface {
}

const Header: React.FC<HeaderInterface> = () => {
    // @ts-ignore
    return (
        <div className={'header'}>
            <img className={'header__logo-svg'} src={tcLogo} alt="TimeCamp logo" />
        </div>
    );
}

export default Header;
