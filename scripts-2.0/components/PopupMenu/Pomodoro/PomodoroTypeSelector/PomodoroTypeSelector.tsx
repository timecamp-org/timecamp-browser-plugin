import * as React from 'react';
import Dropdown from '../../../Dropdown';
import './styles.scss';


const browser = require("webextension-polyfill");

import StorageManager from '../../../../StorageManager';
import FocusPhaseDropdownContent from './PomodoroTypeSelectorContent';
import FocusPhaseDropdownLabel from './PomodoroTypeSelectorLabel';
import { PomodoroContext } from '../PomodoroContext';

const FocusPhase =( )=>{
    const {
        type: [selectedFocusPhase, setSelectedFocusPhase]
    } = React.useContext(PomodoroContext)
    const [ isDropdownOpen, setIsDropdownOpen] = React.useState(false)
    const ulRef = React.useRef<HTMLUListElement>(null)
 
    React.useEffect(()=>{
        const handler = (e)=>{
            if(ulRef.current?.contains(e.target)){
                return
            }            
            setIsDropdownOpen(false);
        }

        document.addEventListener('click', handler, true)

        return ()=>{
            document.removeEventListener('click', handler, true)
        }
        
    },[])

    return  <Dropdown
        additionalClass={['focus-phase', isDropdownOpen? "focus-phase__dropdown-open":""]}
        isOpen={isDropdownOpen}
        onDropdownButtonClick={()=>{
            setIsDropdownOpen(!isDropdownOpen)
        }}
        children={ <FocusPhaseDropdownContent
            ref={ulRef}
            onClick={e=>{  
                browser.runtime.sendMessage({
                    type: 'saveSettingToStorage',
                    name: StorageManager.POMODORO_TYPE,
                    value: e})

                setSelectedFocusPhase(e)
                setIsDropdownOpen(false)
        }}/>}
        text={<FocusPhaseDropdownLabel value={selectedFocusPhase}/>}
        onBackdropClick={()=>{
            setIsDropdownOpen(false)
        }}
        />         
}

export default FocusPhase