import * as React from "react";
import './styles.scss';

export interface PropTypes {
  isChecked: boolean;
}

const Checkbox: React.FC<PropTypes> = (props) => {
  return (
    <div className="Checkbox">
      <input type="checkbox" checked={props.isChecked} />
      <span className="Checkbox__checkmark"></span>
    </div>
  );
}

export default Checkbox;