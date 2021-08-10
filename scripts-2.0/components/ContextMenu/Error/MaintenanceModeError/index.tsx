import * as React from "react";
import {useEffect, useState} from "react";
import ContextMenuOverlay from "../../../ContextMenuOverlay";
import translate from "../../../../Translator";
// @ts-ignore
import imageSrc from "../../../../../images/maintenance.svg";


export interface MaintenanceModeErrorInterface {
    visible: boolean,
}

const MaintenanceModeError: React.FC<MaintenanceModeErrorInterface> = (props) => {
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
            title={translate('maintenance_mode_error_title')}
            titleVisible={true}
            message={translate('maintenance_mode_error_message')}
            messageVisible={true}
            buttonVisible={false}
        />
    );
};

export default MaintenanceModeError;
