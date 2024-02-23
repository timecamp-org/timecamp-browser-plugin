import * as React from 'react';
import { PomodoroTypes } from '../../../../helpers/pomodoro';

interface FocusPhaseDropdownLabelProps {    
    value: PomodoroTypes;
}

const FocusPhaseDropdownLabel =({value}: FocusPhaseDropdownLabelProps)=>{
    return <span className='focus-phase-dropdown-label'>{value}</span>
}

export default FocusPhaseDropdownLabel