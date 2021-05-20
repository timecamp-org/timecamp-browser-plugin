import * as React from "react";

import './styles.scss';

export interface ButtonInterface {
    class: string,
    onClick: any
}

const Button: React.FC<ButtonInterface> = (props) => {
    return (
        <button className={'button ' + props.class} onClick={props.onClick}>
            {props.children}
        </button>
    );
}

export default Button;
