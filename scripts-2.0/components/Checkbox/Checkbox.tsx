import * as React from "react";
import './styles.scss';

export interface PropTypes {
  isChecked: boolean;
  onClick?: ()=>void
}

const Checkbox: React.FC<PropTypes> = (props) => {
  return (
    <div className="Checkbox" onClick={props.onClick}>
      <input type="checkbox" checked={props.isChecked} />
      <span className="Checkbox__checkmark"></span>
    </div>
  );
}

export default Checkbox;