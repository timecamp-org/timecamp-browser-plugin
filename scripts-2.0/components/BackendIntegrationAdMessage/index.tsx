import * as React from "react";
import './styles.scss';
import translate from "../../Translator";
import ReactHtmlParser from "react-html-parser";
import Icon from "../Icon";
import {IconName} from "../../icons/types";
import {useState} from "react";
import PathService from '../../PathService';

export interface BackendIntegrationAdMessageInterface {
    visible: boolean,
    isAdmin: boolean,
    userId: number,
    service: string | React.ReactNode,
    browser: any,
}

const pathService = new PathService();

const BackendIntegrationAdMessage: React.FC<BackendIntegrationAdMessageInterface> = (props) => {
    const [messageClosed, setMessageClosed] = useState<boolean>(true);

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
            <div className={"backend-integration-close-section"} onClick={(e) => {
                e.stopPropagation();
                props.browser.runtime.sendMessage({
                    type: 'saveUserSetting',
                    name: 'dont_show_backend_integration_browser_plugin_ad',
                    userId: props.userId
                }).then(() => {
                });
                setMessageClosed(true);
            }}>
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

    React.useEffect(() => {
        props.browser.runtime.sendMessage({
            type: 'getUserSetting',
            name: 'dont_show_backend_integration_browser_plugin_ad',
            userId: props.userId,
            timestamp: true
        }).then((resolve) => {
            console.log(resolve);
            if(resolve.modify_time === false || (new Date().getTime() - new Date(resolve.modify_time).getTime()) > 2592000000) {
                setMessageClosed(false);
                return;
            }

            if(parseInt(resolve.value) === 1) {
                setMessageClosed(true);
                return;
            }

            if(resolve.value === "" || parseInt(resolve.value) === 0) {
                setMessageClosed(false);
                return;
            }

        }).catch(() => {
            setMessageClosed(false);
        });
    }, [props.userId]);

    return <React.Fragment>
        {
            props.visible && !messageClosed && renderContainer()
        }
    </React.Fragment>;
};

export default BackendIntegrationAdMessage;
