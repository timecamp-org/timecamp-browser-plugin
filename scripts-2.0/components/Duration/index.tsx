import * as React from "react";
import translate from "../../Translator";

import './styles.scss';

export interface DurationInterface {
}

const Duration: React.FC<DurationInterface> = () => {
    return (
        <div className={'duration'}>
            <label>{translate('duration')}</label>
            <input
                className={'duration__input'}
                id={'contextMenuDurationInput'}
                disabled={true}
            />
        </div>
    );
}

export default Duration;
