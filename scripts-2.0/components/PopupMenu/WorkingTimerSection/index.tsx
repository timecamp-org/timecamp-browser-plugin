import * as React from "react";
import {useEffect, useState} from "react";
import './styles.scss';
// @ts-ignore
import tcStopButton from "../../../icons/stop-button-small.svg";
import {Entry} from "../index";
import translate from "../../../Translator";
import TimeFormatter, {DURATION_FORMATS} from "../../../TimeFormatter";
import Icon from '../../Icon'
import {IconName} from '../../../icons/types'
const timeFormatter = new TimeFormatter();

export interface WorkingTimerSectionInterface {
    isTimerWorking: boolean,
    entry: Entry,
    stopTimerCallback: Function
}

const WorkingTimerSection: React.FC<WorkingTimerSectionInterface> = (props) => {
    const [isTimerWorking, setIsTimerWorking] = useState(false);
    const [entry, setEntry] = useState<Entry>(props.entry);
    const [currentTimer, setCurrentTimer] = useState(timeFormatter.formatToDuration(0));
    const stopTimerCallback = props.stopTimerCallback;
    const durationFormat = DURATION_FORMATS.HHMMSS;

    useEffect(() => {
        setIsTimerWorking(props.isTimerWorking);
        setEntry(props.entry);

        const interval = setInterval(() => {
            if (isTimerWorking) {
                setCurrentTimer(
                    timeFormatter.format(props.entry.startedAt, durationFormat)
                );
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [props]);

    const stopTimer = () => {
        stopTimerCallback();
    }

    return (
        <div className='working-timer'>
            <p className='working-timer__title'>{translate('currently_running_timer')}:</p>

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
