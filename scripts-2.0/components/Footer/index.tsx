import * as React from "react";
import translate from "../../Translator";
import Button from "../common/Button";

import './styles.scss';
import {IconName} from "../../icons/types";
import Icon from "../Icon";

export interface FooterInterface {
    onClickSave: any,
    onClickCancel: any,
    idDisabled?: boolean
}

const Footer: React.FC<FooterInterface> = (props) => {
    return (
        <div className={'footer'}>
            <div className={'footer__buttons'}>
                <Button 
                    class={'footer__button-save' + (props.idDisabled ? ' footer__button-disabled' : '')} 
                    onClick={!props.idDisabled ? props.onClickSave : () => {}}
                >
                    <Icon name={IconName.PLAY}/>&nbsp;
                    {translate('start_timer')}
                </Button>
                    
                <Button class={'footer__button-cancel'} onClick={props.onClickCancel}>
                    {translate('cancel')}
                </Button>
            </div>
        </div>
    );
};

export default Footer;
