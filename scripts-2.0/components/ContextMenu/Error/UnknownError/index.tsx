import * as React from "react";
import {useEffect, useState} from "react";
import ContextMenuMessage, {MessageType} from "../../../ContextMenuMessage";
import {IconName} from "../../../../icons/types";

export interface UnknownErrorInterface {
    visible: boolean,
    message: string,
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
            message={props.message}
            bottomCloseSectionVisible={false}
            topCloseSectionVisible={true}
            iconVisible={true}
            icon={IconName.EXCLAMATION_TRIANGLE}
            style={MessageType.MESSAGE_TYPE_ERROR}
        />
    );
};

export default UnknownError;
