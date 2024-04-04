import * as React from "react";
import {useEffect, useRef, useState} from "react";
import './styles.scss';
import Icon from "../../Icon";
import {IconName} from "../../../icons/types";
import DateTime from "../../../helpers/DateTime";

const dateTime = new DateTime();

const SEPARATOR = ':';
const AM = 'am';
const PM = 'pm';
const INPUT_TYPE_HOUR_24 = 'hour24';
const INPUT_TYPE_HOUR_12 = 'hour12';
const INPUT_TYPE_MINUTES = 'minutes';
const INPUT_TYPE_MERIDIAN = 'meridian';

export interface TimePickerInterface {
    is12hFormat: boolean,
    time: Date|null,
    placeholder: string,
    canBeNull?: boolean|null
    onValueChange(newValue: any): any
}

const TimePicker: React.FC<TimePickerInterface> = (props) => {
    const node = useRef<HTMLDivElement>(null);
    const hour12Input = useRef<HTMLInputElement>(null);
    const hour24Input = useRef<HTMLInputElement>(null);
    const minutesInput = useRef<HTMLInputElement>(null);
    const meridianInput = useRef<HTMLInputElement>(null);

    const [is12hFormat, setIs12hFormat] = useState(props.is12hFormat);
    const [hour12Value, setHour12Value] = useState('00');
    const [hour24Value, setHour24Value] = useState('00');
    const [minutesValue, setMinutesValue] = useState('00');
    const [meridianValue, setMeridianValue] = useState(AM);

    const [dateTimeValue, setDateTimeValue] = useState<Date|null>(props.time === null ? null : props.time);
    const [isFirstCharEntered, setIsFirstCharEntered] = useState<boolean>(true);
    const [isModifiedByArrowKey, setIsModifiedByArrowKey] = useState<boolean>(false);
    const [lastEditElement, setLastEditElement] = useState(is12hFormat ? INPUT_TYPE_HOUR_12 : INPUT_TYPE_HOUR_24);
    const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(dateTimeValue === null);

    useEffect(() => {
        setIs12hFormat(props.is12hFormat)
    }, [props.is12hFormat]);

    useEffect(() => {
        setDateTimeValue(props.time);
    }, [props.time]);

    useEffect(() => {
        updateTimeOnPicker();
        if (dateTimeValue === null) {
            setIsPlaceholderVisible(true);
        }
    }, [dateTimeValue]);

    useEffect(() => {
        updateTimeValue();
    }, [hour12Value, hour24Value, minutesValue, meridianValue]);

    useEffect(() => {
        if (!isPlaceholderVisible) {
            setDefaultFocus();
        }
    }, [isPlaceholderVisible]);

    const updateTimeOnPicker = () => {
        let hour12 = '12';
        let hour24 = '00';
        let minutes = '00';
        let meridian = AM;

        if (dateTimeValue != undefined) {
            hour12 = dateTime.getHours(dateTimeValue, false);
            if (parseInt(hour12) === 0) {
                hour12 = '12';
            }
            hour24 = dateTime.getHours(dateTimeValue);
            minutes = dateTime.getMinutes(dateTimeValue);
            meridian = dateTime.getMeridianValue(dateTimeValue);
        }
        setHour12Value(hour12);
        setHour24Value(hour24);
        setMinutesValue(minutes);
        setMeridianValue(meridian);
    };
    const setTimeValueIfUndefined = () => {
        if (dateTimeValue == undefined) {
            let now = dateTime.getNowDateForDuration();
            setDateTimeValue(now);

            props.onValueChange(now);
        }
    };

    const updateTimeValue = () => {
        if (dateTimeValue == undefined) {
            return;
        }

        if (
            parseInt(hour12Value) != 0 ||
            parseInt(hour24Value) != 0 ||
            parseInt(minutesValue) != 0
        ) {
            let hours;
            if (is12hFormat) {
                hours = hour12Value;
                if (meridianValue === AM && parseInt(hours) === 12) {
                    hours = 0;
                }
                if (meridianValue === PM && parseInt(hours) !== 12) {
                    hours = parseInt(hours) + 12;
                }
            } else {
                hours = hour24Value;
            }

            let newTime = new Date(dateTimeValue.getTime());
            newTime.setHours(hours);
            newTime.setMinutes(parseInt(minutesValue));
            newTime.setDate(dateTimeValue.getDate());
            newTime.setMonth(dateTimeValue.getMonth());
            newTime.setFullYear(dateTimeValue.getFullYear());

            setDateTimeValue(newTime);
            setIsPlaceholderVisible(false);

            props.onValueChange(newTime);
        }
    };

    const setFocusToInput = (inupt) => {
        if (inupt != null) {
            inupt.current.focus();
        }
    };

    const validateDataForInput = (value, htmlElem) => {
        value = htmlElem.current.max < value ? htmlElem.current.max : value;
        value = htmlElem.current.min > value ? htmlElem.current.min : value;

        return addLeadingZero(value);
    };

    const addLeadingZero = (value) => {
        let valueInt = parseInt(value);
        if (valueInt < 10) {
            value = '0' + valueInt;
        }

        return value;
    };

    const onButtonArrowClick = (e, clickUp) => {
        e.preventDefault();
        e.stopPropagation();

        let value = 0;
        switch (lastEditElement) {
            case INPUT_TYPE_HOUR_24:
                value = parseInt(hour24Value);
                clickUp ? value++ : value--;
                setHour24Value(validateDataForInput(value, hour24Input));
                break;

            case INPUT_TYPE_HOUR_12:
                value = parseInt(hour12Value);
                clickUp ? value++ : value--;
                setHour12Value(validateDataForInput(value, hour12Input));
                break;

            case INPUT_TYPE_MINUTES:
                value = parseInt(minutesValue);
                clickUp ? value++ : value--;
                setMinutesValue(validateDataForInput(value, minutesInput));
                break;

            case INPUT_TYPE_MERIDIAN:
                setMeridianValue(meridianValue === AM ? PM : AM);
                break;
            default:
        }
    };

    const onBackspacePressed = (e) => {
        e.preventDefault();
        if (props.canBeNull) {
            setIsPlaceholderVisible(true);
            setDateTimeValue(null);
            props.onValueChange(null);
        } else {
            let now = dateTime.getNowDateForDuration();
            setDateTimeValue(now);

            props.onValueChange(now);
        }
    };

    const setDefaultFocus = () => {
        setFocusToInput(is12hFormat ? hour12Input : hour24Input);
    };

    const onInputChange = (e) => {
        switch (e.target.name) {
            case INPUT_TYPE_HOUR_24:
                calculateInput(
                    e,
                    setHour24Value,
                    hour24Input,
                    minutesInput,
                    3
                );
                break;

            case INPUT_TYPE_HOUR_12:
                calculateInput(
                    e,
                    setHour12Value,
                    hour12Input,
                    minutesInput,
                    2
                );
                break;

            case INPUT_TYPE_MINUTES:
                calculateInput(
                    e,
                    setMinutesValue,
                    minutesInput,
                    is12hFormat ? meridianInput : null,
                    6
                );
                break;

            case INPUT_TYPE_MERIDIAN:
                if (isModifiedByArrowKey) {
                    setMeridianValue(meridianValue === AM ? PM : AM);
                }

                if (e.target.value === 'p') {
                    setMeridianValue(PM);
                }
                if (e.target.value === 'a') {
                    setMeridianValue(AM);
                }
                break;

            default:
        }
    };

    const calculateInput = (e, inputValueChangeCallback, htmlElem, nextHtmlElem, maxValOfFirstDigit) => {
        // @ts-ignore
        let lastTypedChar = parseInt(e.target.value.slice(-1));
        let value;

        if (isModifiedByArrowKey) {
            let lastTypedChar = e.target.value;
            value = lastTypedChar + '';
            value = addLeadingZero(value);

            inputValueChangeCallback(value);
            // @ts-ignore
            htmlElem.current.dataset.lastValue = value;

            return value;
        }

        if (isFirstCharEntered) {
            value = addLeadingZero(lastTypedChar)
            value = validateDataForInput(value, htmlElem);
            inputValueChangeCallback(value);
            // @ts-ignore
            htmlElem.current.dataset.lastValue = value;

            if (lastTypedChar >= maxValOfFirstDigit) {
                setFocusToInput(nextHtmlElem);
                return value;
            }
            setIsFirstCharEntered(false);

            return value;
        }

        // @ts-ignore
        let lastValue = htmlElem.current.dataset.lastValue.slice(-1);

        value = lastValue + lastTypedChar;
        value = validateDataForInput(value, htmlElem);
        inputValueChangeCallback(value);
        // @ts-ignore
        htmlElem.current.dataset.lastValue = value;
        setFocusToInput(nextHtmlElem);
        setIsFirstCharEntered(true);

        return value;
    };

    const renderPickerContent = () => {
        return <React.Fragment>
            {!is12hFormat && <input
                ref={hour24Input}
                className='time-picker__input-picker hourPicker'
                type='number'
                step='1'
                autoComplete='off'
                min={0}
                max={23}
                size={2}
                name={INPUT_TYPE_HOUR_24}
                value={hour24Value}
                onChange={(e) => {
                    onInputChange(e);
                }}
                onKeyDown={(e) => {
                    setIsModifiedByArrowKey(false);
                    switch (e.key) {
                        case 'ArrowUp':
                        case 'ArrowDown':
                            setIsFirstCharEntered(true);
                            setIsModifiedByArrowKey(true);
                            break;
                        case 'ArrowRight':
                            setIsFirstCharEntered(true);
                            setFocusToInput(minutesInput);
                            break;
                        case 'Backspace':
                            onBackspacePressed(e);
                            break;
                        default:
                            setFocusToInput(hour24Input);
                    }
                }}
                onFocus={(e) => {
                    const target = e.target;
                    setTimeout(() => target.select(), 0);
                    setLastEditElement(INPUT_TYPE_HOUR_24);
                }}
                onClick={() => {
                    setIsFirstCharEntered(true);
                }}
            />}

            {is12hFormat && <input
                ref={hour12Input}
                className='time-picker__input-picker hourPicker'
                type='number'
                step='1'
                autoComplete='off'
                min={0}
                max={12}
                size={2}
                name={INPUT_TYPE_HOUR_12}
                value={hour12Value}
                onChange={(e) => {
                    onInputChange(e);
                }}
                onKeyDown={(e) => {
                    setIsModifiedByArrowKey(false);
                    switch (e.key) {
                        case 'ArrowUp':
                        case 'ArrowDown':
                            setIsFirstCharEntered(true);
                            setIsModifiedByArrowKey(true);
                            break;
                        case 'ArrowRight':
                            setIsFirstCharEntered(true);
                            setFocusToInput(minutesInput);
                            break;
                        case 'Backspace':
                            onBackspacePressed(e);
                            break;
                        default:
                            setFocusToInput(hour12Input);
                    }
                }}
                onFocus={(e) => {
                    const target = e.target;
                    setTimeout(() => target.select(), 0);
                    setLastEditElement(INPUT_TYPE_HOUR_12);
                }}
                onClick={() => {
                    setIsFirstCharEntered(true);
                }}
            />}

            {SEPARATOR}

            <input
                ref={minutesInput}
                className='time-picker__input-picker minutesPicker'
                type='number'
                step='1'
                autoComplete='off'
                min={0}
                max={59}
                size={2}
                name={INPUT_TYPE_MINUTES}
                value={minutesValue}
                onKeyDown={(e) => {
                    setIsModifiedByArrowKey(false);
                    switch (e.key) {
                        case 'ArrowUp':
                        case 'ArrowDown':
                            setIsModifiedByArrowKey(true);
                            setFocusToInput(minutesInput);
                            setIsFirstCharEntered(true);
                            break;
                        case 'ArrowLeft':
                            setFocusToInput(is12hFormat ? hour12Input : hour24Input);
                            setIsFirstCharEntered(true);
                            break;
                        case 'ArrowRight':
                            if (is12hFormat) {
                                setFocusToInput(meridianInput);
                            }
                            setIsFirstCharEntered(true);
                            break;
                        case 'Backspace':
                            onBackspacePressed(e);
                            break;
                        default:
                            setFocusToInput(minutesInput);
                    }
                    return false;
                }}
                onChange={(e) => {
                    onInputChange(e);
                }}
                onFocus={(e) => {
                    const target = e.target;
                    setTimeout(() => target.select(), 0);
                    setLastEditElement(INPUT_TYPE_MINUTES);
                }}
                onClick={() => {
                    setIsFirstCharEntered(true);
                }}
            />

            {is12hFormat && <input
                ref={meridianInput}
                className='time-picker__input-picker meridianPicker'
                autoComplete='off'
                name={INPUT_TYPE_MERIDIAN}
                size={2}
                value={meridianValue}

                onChange={(e) => {
                    onInputChange(e);
                }}

                onFocus={(e) => {
                    const target = e.target;
                    setTimeout(() => target.select(), 0);
                    setLastEditElement(INPUT_TYPE_MERIDIAN);
                }}

                onKeyDown={(e) => {
                    switch (e.key) {
                        case 'ArrowUp':
                        case 'ArrowDown':
                            setIsModifiedByArrowKey(true);
                            onInputChange(e);
                            setIsFirstCharEntered(true);
                            setFocusToInput(meridianInput);
                            break;
                        case 'ArrowLeft':
                            setIsFirstCharEntered(true);
                            setFocusToInput(minutesInput);
                            break;
                        case 'Backspace':
                            onBackspacePressed(e);
                            break;
                        default:
                            setFocusToInput(meridianInput);
                    }
                }}
            />}

            <div className={'time-picker__arrows'}>
                <span
                    className={'arrow time-picker__arrows--up'}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onButtonArrowClick(e, true);
                    }}
                >
                    <Icon name={IconName.CHEVRON_UP} />
                </span>

                <span
                    className={'arrow time-picker__arrows--down'}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onButtonArrowClick(e, false);
                    }}
                >
                    <Icon name={IconName.CHEVRON_DOWN} />
                </span>
            </div>

        </React.Fragment>;
    }

    const renderPlaceholder = () => {
        return <React.Fragment>
            <p className={'time-picker__placeholder'}>{props.placeholder}</p>
        </React.Fragment>
    }

    return (
        <div
            ref={node}
            className={`time-picker`}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation()
                setIsPlaceholderVisible(false);
                setTimeValueIfUndefined();
                if (e.target === node.current) {
                    setDefaultFocus();
                }
            }}
        >
            {!isPlaceholderVisible && renderPickerContent()}
            {isPlaceholderVisible && renderPlaceholder()}
        </div>
    );
};

export default TimePicker;
