import * as React from 'react';
import TimePicker from ".";

export default <TimePicker
    is12hFormat={true}
    time={null}
    placeholder={'Start timer'}
    onValueChange={(newValue) => {
        console.log(newValue);
    }}
/>;
