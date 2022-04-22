import * as React from "react";
import './styles.scss';

export interface WrongDatesErrorInterface {
    visible: boolean,
    message: string,
}

const WrongDatesError: React.FC<WrongDatesErrorInterface> = (props) => {
    return (
        <React.Fragment>
            {props.visible && <div className='wrong-dates-error'>
                {props.message}
            </div>}
        </React.Fragment>
    );
};

export default WrongDatesError;
