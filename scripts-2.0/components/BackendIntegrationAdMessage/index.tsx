import * as React from "react";
import './styles.scss';
import translate from "../../Translator";
import ReactHtmlParser from "react-html-parser";
import Icon from "../Icon";
import {IconName} from "../../icons/types";
import {MouseEventHandler} from "react";
import PathService from '../../PathService';

export interface BackendIntegrationAdMessageInterface {
    visible: boolean,
    isAdmin: boolean,
    userId: number,
    service: string | React.ReactNode,
    browser: any,
    onClose: MouseEventHandler<HTMLDivElement>;
}

const pathService = new PathService();

const BackendIntegrationAdMessage: React.FC<BackendIntegrationAdMessageInterface> = (props) => {

    const renderLightBulbIcon = () => {
        return <div className={"backend-integration-ad-icon"}><Icon iconPrefix={"fal"} name={IconName.LIGHT_BULB} /></div>
    };

    const renderMessage = (service: string | React.ReactNode) => {
        return <div className={"backend-integration-message-text"}>
            {props.isAdmin ? ReactHtmlParser((translate('backend_integration_ad_message_admin')
                        .replace('*service*', service)
                        .replace('*linkStart*', "<a style='text-transform: capitalize;' target='_blank' href='" + pathService.getIntegrationUrl(service) + "'>")
                        .replace('*linkClose*', '</a>')
            )) :
                ReactHtmlParser((translate('backend_integration_ad_message_user')
                .replace('*service*', service)
                .replace('*linkStart*', "<a style='text-transform: capitalize;' target='_blank' href='" + pathService.getIntegrationWebsiteUrl(service) + "'>")
                .replace('*linkClose*', '</a>')))
            }
        </div>
    };

    const renderCloseSection = () => {
        return <React.Fragment>
            <div className={"backend-integration-close-section"} onClick={props.onClose}>
                <div className={"backend-integration-ad-icon"}><Icon name={IconName.CLOSE}/></div>
                <div className={"backend-integration-ad-dont-show-up-message"}>
                    { translate('backend_integration_ad_message_dont_show_up_button') }
                </div>
            </div>
        </React.Fragment>
    };

    const renderContainer = () => {
        return <div className={"backend-integration-message-container"}>
            { renderLightBulbIcon() }
            { renderMessage(props.service) }
            { renderCloseSection() }
        </div>
    };

    return <React.Fragment>
        {
            props.visible && renderContainer()
        }
    </React.Fragment>;
};

export default BackendIntegrationAdMessage;
