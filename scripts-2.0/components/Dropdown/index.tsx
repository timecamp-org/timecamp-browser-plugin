import * as React from "react";
import {IconName} from '../../icons/types';
import Icon from '../Icon';
import {DropdownHookInterface, useDropdownHook} from './hook';

import './styles.scss';

interface DropdownInterface {
  text: string | React.ReactNode;
  children?: React.ReactNode;

  isOpen: boolean;

  isDisabled?: boolean;
  additionalClass?: string[];

  onDropdownButtonClick: (e) => void;
  onBackdropClick: (e) => void;
}

const Dropdown: React.FC<DropdownInterface> = (props) => {

  const hook = useDropdownHook();

  const renderBackdrop = (onBackdropClick: (e) => void) => (
      <div className="Dropdown__backdrop" onClick={onBackdropClick}/>
  );

  const renderButton = (
      props: DropdownInterface,
      hook: DropdownHookInterface
  ) => {
    return (
        <div
            ref={hook.buttonRef}
            className={`
        Dropdown__button
        ${props.isOpen ? 'Dropdown__button--open' : ''}
        ${props.isDisabled ? 'Dropdown__button--disabled' : ''}
      `}
            onClick={props.onDropdownButtonClick}
        >
          <div className="Dropdown__button-text">{props.text}</div>
          {renderIcon(props.isOpen)}
        </div>
    );
  };

  const renderContentBox = (
      props: DropdownInterface,
      hook: DropdownHookInterface
  ) => {
    const {top, left, width} = hook.calculateDropdownPosition();

    return (
        <div
            style={{top, left, width}}
            className="Dropdown__content-box"
            ref={(ref) => {
                if(ref === null) {
                    return;
                }
                if((ref.clientHeight + parseInt(ref.style.top)) > window.innerHeight) {
                    ref.style.top = ((window.innerHeight - ref.clientHeight - 10).toString() + 'px');
                }
            }}
        >
          {props.children}
        </div>
    );
  };

  const renderIcon = (
      isOpen: boolean
  ) => {
    return (
        <div className="Dropdown__icon-box">
          <Icon
              className={`
          Dropdown__icon
          ${isOpen ? 'Dropdown__icon--open' : ''}
        `}
              name={isOpen ? IconName.CHEVRON_UP : IconName.CHEVRON_DOWN}
          />
        </div>
    );
  };

  return (
      <div className={"Dropdown" + props.additionalClass ? (" " + props.additionalClass?.join(' ')) : ""}>
        {renderButton(props, hook)}
        {props.isOpen && renderBackdrop(props.onBackdropClick)}
        {props.isOpen && renderContentBox(props, hook)}
      </div>
  );

};
export default Dropdown;
