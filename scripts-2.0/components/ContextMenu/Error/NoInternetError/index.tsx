const browser = require('webextension-polyfill');
import * as React from "react";
import {useEffect, useState} from "react";
import ContextMenuOverlay from "../../../ContextMenuOverlay";
import Button from "../../../common/Button";
import translate from "../../../../Translator";
// @ts-ignore
import imageSrc from "../../../../../images/no-internet.svg";


export interface NoInternetErrorInterface {
    visible: boolean,
}

const NoInternetError: React.FC<NoInternetErrorInterface> = (props) => {
    const [visible, setVisible] = useState<boolean>(props.visible);

    useEffect(() => {
        setVisible(props.visible)
    }, [props]);

    return (
        <ContextMenuOverlay
            visible={visible}
            iconVisible={true}
            mainImage={<img src={imageSrc}/>}
            mainImageVisible={true}
            title={translate('no_internet_error_title')}
            titleVisible={true}
            message={translate('no_internet_error_message')}
            messageVisible={true}
            buttonVisible={true}
            button={
                <Button
                    class={''}
                    onClick={() => {
                        browser.runtime.sendMessage({
                            type: 'ping',
                        }).then(() => {
                        }).catch(() => {
                        });
                    }}
                >{translate('refresh_page')}</Button>
            }
        />
    );
};

export default NoInternetError;
