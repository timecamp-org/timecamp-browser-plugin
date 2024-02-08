import * as React from "react";
import {useEffect, useState} from "react";
import './styles.scss';
import TimePicker from "../common/TimePicker";
import translate from "../../Translator";
import DateTime from "../../helpers/DateTime";
import TimeFormatter from "../../TimeFormatter";

const dateTime = new DateTime();
const timeFormatter = new TimeFormatter();

export interface TimeSelectorsInterface {
    is12hFormat: boolean,
    clearFormTrigger: boolean,
    startTime: Date|null,
    stopTime: Date|null,
    durationFormat?: number|null,
    onStartTimeValueChange(newValue: any): any
    onStopTimeValueChange?(newValue: any): any
}

const TimeSelectors: React.FC<TimeSelectorsInterface> = (props) => {
    const [startTime, setStartTime] = useState<Date|null>(props.startTime);
    const [stopTime, setStopTime] = useState<Date|null>(props.stopTime);
    const [duration, setDuration] = useState<string>();
    const [durationFormat, setDurationFormat] = useState<number>(timeFormatter.DEFAULT_FORMAT);
    const [is12hFormat, setIs12hFormat] = useState<boolean>(false);
    const [startTimeModifiedManually, setStartTimeModifiedManually] = useState<boolean>(false);

    useEffect(() => {
        setIs12hFormat(props.is12hFormat);

        const interval = setInterval(() => {
            if (stopTime === null && !startTimeModifiedManually) {
                setStartTime(dateTime.getNowDateForDuration());
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [props]);

    useEffect(() => {
        if (props.durationFormat != null) {
            setDurationFormat(props.durationFormat);
        }
    }, [props.durationFormat]);

    useEffect(() => {
        if (durationFormat != null) {
            calculateAndSetDuration();
        }
    }, [durationFormat]);

    useEffect(() => {
        clearForm();
    }, [props.clearFormTrigger]);

    useEffect(() => {
        props.onStartTimeValueChange(startTime);
        validateBoth();
        calculateAndSetDuration();
    }, [startTime]);

    useEffect(() => {
        props.onStopTimeValueChange?.(stopTime);
        validateBoth();
        validateStartTime();
        calculateAndSetDuration();
    }, [stopTime]);

    const clearForm = () => {
        setStopTime(null);
        setStartTime(dateTime.getNowDateForDuration());
        setStartTimeModifiedManually(false);
    }

    const validateBoth = () => {
        //set stop time same as start time if stopTime is bigger
        if (
            startTime != undefined &&
            stopTime != undefined &&
            stopTime.getTime() < startTime.getTime()
        ) {
            setStopTime(startTime);
        }
    }

    const validateStartTime = () => {
        if (stopTime == undefined && startTime != undefined
            && startTime > dateTime.getNowDateForDuration()
        ) {
            setStartTime(dateTime.getNowDateForDuration());
        }
    }

    const calculateDurationInSeconds = () => {
        let stopTimeToCalculate = stopTime;
        if (stopTimeToCalculate == undefined) {
            stopTimeToCalculate = dateTime.getNowDateForDuration();
        }

        // @ts-ignore
        let durationInMilliseconds = startTime.getTime() - stopTimeToCalculate.getTime();

        return Math.abs(durationInMilliseconds / 1000);
    }

    const calculateAndSetDuration = () => {
        if (startTime === null) {
            return;
        }

        let durationInSeconds = calculateDurationInSeconds();
        let secondsFormatted = timeFormatter.formatToDuration(durationInSeconds, durationFormat);
        setDuration(secondsFormatted);
    }

    return (
        <div className='time-selectors'>
            <div className='time-selector time-selectors__start'>
                <label>{translate('start')}</label>
                <TimePicker
                    is12hFormat={is12hFormat}
                    time={startTime}
                    placeholder={''}
                    onValueChange={(value) => {
                        if (value != undefined) {
                            value = new Date(value.getTime());
                        }
                        setStartTime(value);

                        let durationInSeconds = calculateDurationInSeconds();
                        let isModifiedManually = false;
                        if (durationInSeconds !== 0) {
                            isModifiedManually = true;
                        }
                        setStartTimeModifiedManually(isModifiedManually);
                    }}
                />

            </div>
            {
                props.onStopTimeValueChange ?  <React.Fragment>
                    <div className='time-selector time-selectors__stop'>
                        <label>{translate('stop')}</label>
                        <TimePicker
                            is12hFormat={is12hFormat}
                            time={stopTime}
                            placeholder={translate('stop time')}
                            canBeNull={true}
                            onValueChange={(value) => {
                                if (value != undefined) {
                                    value = new Date(value.getTime());
                                }
                                setStopTime(value);
                            }}
                        />
                    </div>
                    <div className='time-selector time-selectors__duration'>
                        <label>{translate('duration')}</label>
                        <input
                            className='time-selector__input'
                            value={duration}
                        />
                    </div>                
                </React.Fragment> : null
            }


        </div>
    );
}

export default TimeSelectors;
