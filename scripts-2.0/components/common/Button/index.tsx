import * as React from "react";

import './styles.scss';

export interface ButtonInterface {
    class: string,
    onClick: any,
    disabled?: boolean
}

const Button: React.FC<ButtonInterface> = (props) => {
    return (
        <button 
            className={'button ' + props.class + (props.disabled ? ' button--disabled' : '')} 
            onClick={props.onClick}
            disabled={props.disabled}
        >
            {props.children}
        </button>
    );
}

export default Button;
