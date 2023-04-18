import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {useOutsideAlerter} from "./onClickOutside";
import "./styles.scss";
import {IconName} from "../../icons/types";
import Icon from "../Icon";
import translate from "../../Translator";
import browser from "webextension-polyfill";

const PeoplePicker = (
    {
        onChange,
        placeHolder = translate("Users"),
    }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [selectedValue, setSelectedValue] = useState([]);
    const [options, setOptions] = useState([]);

    useEffect(() => {
        browser.runtime
            .sendMessage({type: 'getUsers', cacheKey: 'users'})
            .then((users) => {
                let usersOptions = users.map((el) => {
                    return {
                        label: !el.display_name ? el.email: el.display_name,
                        value: el.user_id,
                    };
                });
                setOptions(usersOptions);
            });
    }, []);

    const handleInputClick = () => {
        setShowMenu(!showMenu);
    };

    const getDropdownInputInfo = () => {
        if (!selectedValue || selectedValue.length === 0) {
            return placeHolder;
        }
        return <React.Fragment>{selectedValue.length} {translate('selected')}</React.Fragment>;
    };

    const displayIcon = () => {
        if (showMenu) {
            return <Icon
                name={IconName.CHEVRON_UP}
                iconPrefix={'fal'}
                className='tcDropdown__input__icon--right'
            />;
        }

        if (selectedValue.length > 0) {
            return <Icon
                name={IconName.CLOSE}
                iconPrefix={'fal'}
                onClick={(e) => clearSelection(e)}
                className='tcDropdown__input__icon--right'
            />;
        }

        return <Icon
            name={IconName.CHEVRON_DOWN}
            iconPrefix={'fal'}
            className='tcDropdown__input__icon--right'
        />;
    };

    const removeOption = (option) => {
        // @ts-ignore
        return selectedValue.filter((o) => o.value !== option.value);
    };

    const clearSelection = (e) => {
        setSelectedValue([]);
        e.stopPropagation();
    };

    const onItemClick = (option) => {
        if (option.value === "all") {
            setSelectedValue(selectedValue.length == options.length ? [] : options);
            return;
        }
        let newValue;

        // @ts-ignore
        if (selectedValue.findIndex((o) => o.value === option.value) >= 0) {
            newValue = removeOption(option);
        } else {
            newValue = [...selectedValue, option];
        }
        setSelectedValue(newValue);
    };

    useEffect(() => {
        onChange(selectedValue);
    }, [selectedValue]);

    const isSelected = (option) => {
        if (option.value === "all" && options.length === selectedValue.length) {
            return true;
        }

        // @ts-ignore
        return selectedValue.filter((o) => o.value === option.value).length > 0;
    };

    const getOptions = () => {
        const ALL_OPTION = {
            label: translate('All Users'),
            value: "all"
        };
        return [ALL_OPTION, ...options];
    };

    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef, () => {
        setShowMenu(false);
    });

    return (
        <div
            className={`tcDropdown ${selectedValue.length > 0 ? 'tcDropdown--visible' : ''}`}
        >
            <div onClick={handleInputClick} className="tcDropdown__input">
                <Icon
                    name={IconName.USER_CLOCK}
                    iconPrefix={'fal'}
                    className={'tcDropdown__input__icon--left'}
                />
                <div className="tcDropdown__input__info tcDropdownInfo">{getDropdownInputInfo()}</div>
                {displayIcon()}
            </div>

            {showMenu && (
                <div className="tcDropdown__menu" ref={wrapperRef}>
                    {getOptions().map((option) => (
                        <div
                            onClick={() => onItemClick(option)}
                            key={option.value}
                            className={`tcDropdown__menu__item ${isSelected(option) && "selected"}`}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PeoplePicker;
