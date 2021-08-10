import * as React from "react";
import {useEffect, useState} from "react";
import ContextMenuMessage, {MessageType} from "../../../ContextMenuMessage";
import translate from "../../../../Translator";
import {IconName} from "../../../../icons/types";

export interface UnknownErrorInterface {
    visible: boolean,
    onCloseCallback: Function,
}

const UnknownError: React.FC<UnknownErrorInterface> = (props) => {
    const [visible, setVisible] = useState<boolean>(props.visible);

    useEffect(() => {
        setVisible(props.visible)
    }, [props]);

    return (
        <ContextMenuMessage
            visible={visible}
            onClose={(e) => {
                props.onCloseCallback(e)
            }}
            message={translate('oh_no_something_went_wrong')}
            bottomCloseSectionVisible={false}
            topCloseSectionVisible={true}
            iconVisible={true}
            icon={IconName.EXCLAMATION_TRIANGLE}
            style={MessageType.MESSAGE_TYPE_ERROR}
        />
    );
};

export default UnknownError;
