import * as React from "react";
import {useEffect, useState} from "react";
import ContextMenuOverlay from "../../../ContextMenuOverlay";
import Button from "../../../common/Button";
import translate from "../../../../Translator";
// @ts-ignore
import imageSrc from "../../../../../images/subscription-expired.svg";


export interface SubscriptionExpiredErrorInterface {
    visible: boolean,
}

const SubscriptionExpiredError: React.FC<SubscriptionExpiredErrorInterface> = (props) => {
    const [visible, setVisible] = useState<boolean>(props.visible);
    const serverUrl = process.env.SERVER_PROTOCOL + '://' + process.env.SERVER_DOMAIN + '/';

    useEffect(() => {
        setVisible(props.visible)
    }, [props]);

    return (
        <ContextMenuOverlay
            visible={visible}
            iconVisible={true}
            mainImage={<img src={imageSrc}/>}
            mainImageVisible={true}
            title={translate('subscription_expired_error_title')}
            titleVisible={true}
            message={translate('subscription_expired_error_message')}
            messageVisible={true}
            buttonVisible={true}
            button={
                <a href={serverUrl + 'app/secure#/settings/subscription'} target='_blank'>
                    <Button class={''} onClick={() => {}}>{translate('go_to_subscriton_page')}</Button>
                </a>
            }
        />
    );
};

export default SubscriptionExpiredError;
