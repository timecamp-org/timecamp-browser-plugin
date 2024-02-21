import * as React from "react";
import { useEffect, useState } from "react";
import './styles.scss';
// @ts-ignore
import PathService from "../../../PathService";
import TimeFormatter, { DURATION_FORMATS } from "../../../TimeFormatter";
import translate from "../../../Translator";
import { PomodoroTypes, subtractTime } from "../../../helpers/pomodoro";
// @ts-ignore
import tcStopButton from "../../../icons/stop-button-small.svg";
import { IconName } from '../../../icons/types';
import Icon from '../../Icon';
import { Entry } from "../index";
import { PomodoroContext } from "../Pomodoro/PomodoroContext";
const timeFormatter = new TimeFormatter();

const serverUrl = new PathService().getBaseUrl();

export interface WorkingTimerSectionInterface {
    isTimerWorking: boolean,
    entry: Entry,
    stopTimerCallback: Function
}

const WorkingTimerSection: React.FC<WorkingTimerSectionInterface> = (props) => {
    const {
        isPomodoroEnabled:[isPomodoroEnabled],
        pomodoroDurations: [pomodoroDurationValues],
        type: [pomodoroStartedType, setCurrentSelectedType]
    } = React.useContext(PomodoroContext)
    const [isTimerWorking, setIsTimerWorking] = useState(false);
    const [entry, setEntry] = useState<Entry>(props.entry);
    const [currentTimer, setCurrentTimer] = useState(timeFormatter.formatToDuration(0));

    const stopTimerCallback = props.stopTimerCallback;
    const durationFormat = DURATION_FORMATS.HHMMSS;


    const pomodoroValuesByType ={
        [PomodoroTypes.FOCUS_PHASE]: pomodoroDurationValues.pomodoroFocusPhase,
        [PomodoroTypes.SHORT_BREAK]: pomodoroDurationValues.pomodoroShortBreak,
        [PomodoroTypes.LONG_BREAK]:  pomodoroDurationValues.pomodoroLongBreak
    }

    useEffect(()=>{
        if(!isTimerWorking) {
            setCurrentSelectedType(pomodoroStartedType)
        }
    },[
        pomodoroStartedType
    ])

    useEffect(()=>{
        if(!props.isTimerWorking){
            setCurrentSelectedType(pomodoroStartedType)
        }
    },[
        props.isTimerWorking
    ])
     

    useEffect(() => {
        setIsTimerWorking(props.isTimerWorking);
        setEntry(props.entry);

        const interval = setInterval(() => {                        
            if (isTimerWorking) {
                const diff = timeFormatter.format(props.entry.startedAt, durationFormat)
                const pomodoroValue = pomodoroValuesByType[pomodoroStartedType]
                
                const newTimer = !isPomodoroEnabled? diff : subtractTime( diff, pomodoroValue)
                
                if(newTimer==='00:00:00' || newTimer.includes('-')){
                    stopTimer()       
                    return              
                }

                setCurrentTimer(newTimer);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [props]);

    const stopTimer = () => {
        stopTimerCallback();
        setCurrentSelectedType(pomodoroStartedType)
    }

    return (
        <div className='working-timer'>
            <p className='working-timer__title'>
                <span>{translate('currently_running_timer')}:</span>
                <span className="working-timer__title__timesheet">
                    <div className="working-timer__button-anchor">
                        <a
                        className="working-timer__button-anchor__href"
                        href={serverUrl + "app#/timesheets/graphical"}
                        target="_blank"
                        >
                        <Icon name={IconName.EXTERNAL_LINK} iconPrefix={"fal"} />

                        {translate("see_full_timesheet")}
                        </a>
                    </div>    
                </span>
            </p>

            <div className={`working-timer__entry ${isTimerWorking ? 'working-timer__entry--active' : ''}`}>
                <div className='entry-empty-info'>
                    {translate('there_are_no_running_timers')}
                </div>

                <div className='entry'>
                    <div className='left'>
                        <div className='entry__task-name'>
                            <div className='dot' style={entry.color !== null ? {backgroundColor: entry.color} : {}}/>
                            <div className='name'>{entry.taskName}</div>
                        </div>
                        {entry.breadcrumb && <div className='entry__breadcrumb'>{entry.breadcrumb}</div>}
                        {entry.note && <div className='entry__note'>
                            <Icon name={IconName.STICKY_NOTE} iconPrefix={"far"} />&nbsp;&nbsp;&nbsp;
                            {entry.note}
                        </div>}
                    </div>

                    <div className='right'>
                        <div className='entry__timer'>{currentTimer}</div>
                        <div className='entry__timer-button' onClick={stopTimer}>
                            <img src={tcStopButton} alt="TimeCamp stop button" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkingTimerSection;
