import * as React from "react";
import './styles.scss';
import translate from "../../Translator";
import Icon from "../Icon";
import {IconName} from "../../icons/types";
import {MouseEventHandler, useEffect, useState} from "react";

export interface ContextMenuMessageInterface {
    visible: boolean,
    onClose: MouseEventHandler<HTMLDivElement>;
    message: string,
    bottomCloseSectionVisible?: boolean,
    topCloseSectionVisible?: boolean,
    iconVisible?: boolean,
    icon?: IconName,
    style?: string,
}

const MESSAGE_TYPE_DEFAULT = 'default';
const MESSAGE_TYPE_INFO = 'info';
const MESSAGE_TYPE_ERROR = 'error';
export const MessageType = {
    MESSAGE_TYPE_DEFAULT: MESSAGE_TYPE_DEFAULT,
    MESSAGE_TYPE_INFO: MESSAGE_TYPE_INFO,
    MESSAGE_TYPE_ERROR: MESSAGE_TYPE_ERROR,
}

const ContextMenuMessage: React.FC<ContextMenuMessageInterface> = (props) => {
    const [style, setStyle] = useState(MessageType.MESSAGE_TYPE_DEFAULT);
    const [bottomCloseSectionVisible, setBottomCloseSectionVisible] = useState(props.bottomCloseSectionVisible);
    const [topCloseSectionVisible, setTopCloseSectionVisible] = useState(props.topCloseSectionVisible);
    const [iconVisible, setIconVisible] = useState(props.iconVisible);
    const [icon, setIcon] = useState(props.icon);

    useEffect(() => {
        setStyle(props.style ?? style);
        setBottomCloseSectionVisible(props.bottomCloseSectionVisible ?? true);
        setTopCloseSectionVisible(props.topCloseSectionVisible ?? false);
        setIconVisible(props.iconVisible ?? true);
        setIcon(props.icon ?? IconName.LIGHT_BULB);
    }, [props]);

    const renderIcon = () => {
        return <div className={"context-menu-message__icon"}><Icon iconPrefix={"fal"} name={icon} /></div>
    };

    const renderMessage = () => {
        return <div className={"context-menu-message__message-text"}>
            {props.message}
        </div>
    };

    const renderTopCloseSection = () => {
        return <React.Fragment>
            <div className={"context-menu-message__close-section context-menu-message__close-section--top"} onClick={props.onClose}>
                <div className={"backend-integration-ad-icon"}><Icon name={IconName.CLOSE}/></div>
            </div>
        </React.Fragment>
    };

    const renderBottomCloseSection = () => {
        return <React.Fragment>
            <div className={"context-menu-message__close-section"} onClick={props.onClose}>
                <div className={"context-menu-message__close-section context-menu-message__close-section--bottom"}>
                    { translate('backend_integration_ad_message_dont_show_up_button') }
                </div>
            </div>
        </React.Fragment>
    };

    const renderContainer = () => {
        return <div className={"context-menu-message " + style}>
            { iconVisible && renderIcon() }
            { renderMessage() }
            { topCloseSectionVisible && renderTopCloseSection()}
            { bottomCloseSectionVisible && renderBottomCloseSection() }
        </div>
    };

    return <React.Fragment>
        {
            props.visible && renderContainer()
        }
    </React.Fragment>;
};

export default ContextMenuMessage;
