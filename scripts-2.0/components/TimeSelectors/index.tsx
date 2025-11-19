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
    onStopTimeValueChange(newValue: any): any
}

const TimeSelectors: React.FC<TimeSelectorsInterface> = (props) => {
    const [startTime, setStartTime] = useState<Date|null>(props.startTime);
    const [stopTime, setStopTime] = useState<Date|null>(props.stopTime);
    const [duration, setDuration] = useState<string>();
    const [durationInput, setDurationInput] = useState<string>(duration || "");
    const [durationFormat, setDurationFormat] = useState<number>(timeFormatter.DEFAULT_FORMAT);
    const [is12hFormat, setIs12hFormat] = useState<boolean>(false);
    const [startTimeModifiedManually, setStartTimeModifiedManually] = useState<boolean>(false);
    const ignoreBlur = React.useRef(false);

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
        setDurationInput(duration || "");
    }, [duration]);

    useEffect(() => {
        props.onStartTimeValueChange(startTime);
        validateBoth();
        validateStartTime();
        calculateAndSetDuration();
    }, [startTime]);

    useEffect(() => {
        props.onStopTimeValueChange(stopTime);
        validateBoth();
        validateStartTime();
        calculateAndSetDuration();
    }, [stopTime]);

    useEffect(() => {
        if (startTime && stopTime) {
            let durationSeconds = Math.abs((stopTime.getTime() - startTime.getTime()) / 1000);

            if (durationSeconds > 86400) durationSeconds = 86400;

            const formattedDuration = timeFormatter.formatToDuration(durationSeconds, durationFormat);
            setDuration(formattedDuration);
            setDurationInput(formattedDuration);
        }
    }, [startTime, stopTime, durationFormat]);

    const clearForm = () => {
        setStopTime(null);
        setStartTime(dateTime.getNowDateForDuration());
        setStartTimeModifiedManually(false);
    }

    const validateBoth = () => {
        if (
            startTime !== undefined && startTime !== null &&
            stopTime !== undefined && stopTime !== null &&
            stopTime.getTime() < startTime.getTime()
        ) {
            setStopTime(startTime);
        }
    }

    const validateStartTime = () => {
        if (
            (stopTime === undefined || stopTime === null) &&
            startTime !== undefined && startTime !== null
            && startTime > dateTime.getNowDateForDuration()
        ) {
            setStartTime(dateTime.getNowDateForDuration());
        }
    }

    const calculateDurationInSeconds = () => {
        let stopTimeToCalculate = stopTime;
        if (stopTimeToCalculate == undefined || stopTimeToCalculate === null) {
            stopTimeToCalculate = dateTime.getNowDateForDuration();
        }

        if (startTime == undefined || startTime == null) {
            return 0;
        }

        // @ts-ignore
        let durationInMilliseconds = stopTimeToCalculate.getTime() - startTime.getTime();

        return Math.abs(durationInMilliseconds / 1000);
    }

    const calculateAndSetDuration = () => {
        if (startTime === null || startTime === undefined) {
            return;
        }

        let durationInSeconds = calculateDurationInSeconds();
        let secondsFormatted = timeFormatter.formatToDuration(durationInSeconds, durationFormat);
        setDuration(secondsFormatted);
    }

    const parseDuration = (input: string): number | null => {
        const trimmed = input.trim().toLowerCase();

        //12h 20m, 1.5h,  30m
        const regex = /(\d+(\.\d+)?)(h|m)/g;
        let match;
        let totalSeconds = 0;

        while ((match = regex.exec(trimmed)) !== null) {
            const value = parseFloat(match[1]);
            const unit = match[3];

            if (unit === 'h') {
                if (value > 24) return null;
                totalSeconds += value * 3600;
            } else if (unit === 'm') {
                if (value > 1440) return null;
                totalSeconds += value * 60;
            }
        }

        if (totalSeconds > 0) {
            return totalSeconds;
        }

        //hh:mm
        const hourMinuteMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
        if (hourMinuteMatch) {
            const h = parseInt(hourMinuteMatch[1], 10);
            const m = parseInt(hourMinuteMatch[2], 10);
            if (h < 24 && m < 60) {
                return h * 3600 + m * 60;
            }
            return null;
        }

        return null;
    }

    const onDurationInputConfirm = () => {
        const seconds = parseDuration(durationInput);
        if (seconds === null || seconds > 86400) {
            setDurationInput(duration || "");
            return;
        }

        const now = new Date();

        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date(now);
        todayEnd.setHours(23, 59, 59, 999);

        // Seconds from midnight to current start time or now if startTime is null
        const currentStartTime = startTime || now;
        const secondsFromMidnightToStart = (currentStartTime.getTime() - todayStart.getTime()) / 1000;

        if (seconds > secondsFromMidnightToStart) {
            // Duration is longer than time passed since midnight to startTime
            // Set startTime to midnight
            const newStartTime = todayStart;

            // Calculate stopTime as startTime + duration
            let newStopTime = new Date(newStartTime.getTime() + seconds * 1000);

            // Clamp stopTime to 23:59 if it exceeds today's end
            if (newStopTime > todayEnd) {
                newStopTime = todayEnd;
                const adjustedDuration = (newStopTime.getTime() - newStartTime.getTime()) / 1000;
                const formattedDuration = timeFormatter.formatToDuration(adjustedDuration, durationFormat);
                setDuration(formattedDuration);
                setDurationInput(formattedDuration);
            } else {
                setDuration(durationInput);
            }

            setStartTime(newStartTime);
            setStopTime(newStopTime);
        } else {
            // Duration fits between startTime and now
            // Set stopTime to now
            let newStopTime = now;

            // Calculate startTime as stopTime - duration
            let newStartTime = new Date(newStopTime.getTime() - seconds * 1000);

            // If startTime is before midnight, adjust stopTime to 23:59
            if (newStartTime < todayStart) {
                newStopTime = todayEnd;
                newStartTime = new Date(newStopTime.getTime() - seconds * 1000);

                if (newStartTime < todayStart) {
                    newStartTime = todayStart;
                    const adjustedDuration = (newStopTime.getTime() - newStartTime.getTime()) / 1000;
                    const formattedDuration = timeFormatter.formatToDuration(adjustedDuration, durationFormat);
                    setDuration(formattedDuration);
                    setDurationInput(formattedDuration);
                } else {
                    setDuration(durationInput);
                }
            } else {
                setDuration(durationInput);
            }

            setStartTime(newStartTime);
            setStopTime(newStopTime);
        }

        setStartTimeModifiedManually(true);
    }

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            ignoreBlur.current = true;
            onDurationInputConfirm();
            setTimeout(() => { ignoreBlur.current = false; }, 100);
        }
    };

    const handleBlur = () => {
        if (ignoreBlur.current) {
            return;
        }
        onDurationInputConfirm();
    };

    return (
        <div className='time-selectors'>
            <div className='time-selector time-selectors__start'>
                <label>{translate('start')}</label>
                <TimePicker
                    is12hFormat={is12hFormat}
                    time={startTime}
                    placeholder={''}
                    onValueChange={(value) => {
                        if (value !== undefined && value !== null) {
                            value = new Date(value.getTime());
                        }
                        setStartTime(value);

                        let durationInSeconds = calculateDurationInSeconds();
                        setStartTimeModifiedManually(durationInSeconds !== 0);
                    }}
                />
            </div>

            <div className='time-selector time-selectors__stop'>
                <label>{translate('stop')}</label>
                <TimePicker
                    is12hFormat={is12hFormat}
                    time={stopTime}
                    placeholder={translate('stop time')}
                    canBeNull={true}
                    onValueChange={(value) => {
                        if (value !== undefined && value !== null) {
                            value = new Date(value.getTime());
                        }
                        setStopTime(value);
                        setStartTimeModifiedManually(true);
                    }}
                />
            </div>
            <div className='time-selector time-selectors__duration'>
                <label>{translate('duration')}</label>
                <input
                    className='time-selector__input'
                    value={durationInput}
                    onChange={(e) => setDurationInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                />
            </div>
        </div>
    );
}

export default TimeSelectors;
