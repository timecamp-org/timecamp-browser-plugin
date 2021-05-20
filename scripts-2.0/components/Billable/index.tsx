import * as React from "react";
import translate from "../../Translator";
import {useEffect, useState} from "react";

import './styles.scss';

export interface BillableInterface {
    billable: boolean,
    onBillableChange(newBillable: boolean): any
}

const Billable: React.FC<BillableInterface> = (props) => {
    const [billable, setBillable] = useState(props.billable);

    useEffect(() => {
        setBillable(props.billable);
    }, [props.billable]);
    
    const onClick = () => {
        setBillable(!billable);
        props.onBillableChange(!billable);
    }

    return (
        <div className="billable">
            <label htmlFor="billable" className={'billable__checkbox'} onClick={onClick}>
                <input type="checkbox" name="billable" checked={billable} onClick={onClick} />
                <span className="checkmark" />
                <p className={'billable__text'}>{translate('billable_time_entry')}</p>
            </label>
        </div>
    );
}

export default Billable;
