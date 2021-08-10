import * as React from "react";
import './styles.scss';
import Header from "../Header";
import {useEffect, useState} from "react";

export interface ContextMenuOverlayInterface {
    visible: boolean,
    iconVisible: boolean,
    mainImage?: any,
    mainImageVisible: boolean,
    title?: string,
    titleVisible: boolean,
    message?: string,
    messageVisible: boolean,
    button?: any,
    buttonVisible: boolean,
}

const ContextMenuOverlay: React.FC<ContextMenuOverlayInterface> = (props) => {
    const [visible, setVisible] = useState(props.visible);

    useEffect(() => {
        setVisible(props.visible)
    }, [props]);

    const renderMainImage = () => {
        return <React.Fragment>
            <div className={"context-menu-overlay-content__main-image"}>
                {props.mainImage}
            </div>
        </React.Fragment>
    };

    const renderTitle = () => {
        return <React.Fragment>
            <div className={"context-menu-overlay-content__title"}>
                {props.title}
            </div>
        </React.Fragment>
    };

    const renderMessage= () => {
        return <React.Fragment>
            <div className={"context-menu-overlay-content__message"} dangerouslySetInnerHTML={{ __html: String(props.message) }}>
            </div>
        </React.Fragment>
    };

    const renderButton = () => {
        return <React.Fragment>
            <div className={"context-menu-overlay-content__button"}>
                {props.button}
            </div>
        </React.Fragment>
    };

    const renderIcon = () => {
        return <React.Fragment>
            <div className={"context-menu-overlay__icon"}>
                <Header />
            </div>
        </React.Fragment>
    };

    const renderContainer = () => {
        return <div className={"context-menu-overlay"}>
            {props.iconVisible && renderIcon()}
            <div className='context-menu-overlay-content'>
                {props.mainImageVisible && renderMainImage()}
                {props.titleVisible && renderTitle()}
                {props.messageVisible && renderMessage()}
                {props.buttonVisible && renderButton()}
            </div>
        </div>
    };

    return <React.Fragment>
        {
            visible && renderContainer()
        }
    </React.Fragment>;
};

export default ContextMenuOverlay;
