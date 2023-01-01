import React, { useEffect, useRef, useState } from "react";
import { useOutsideAlerter } from "./onClickOutside";
import "./styles.scss";
import TimeFormatter, { DURATION_FORMATS } from "../../TimeFormatter";

const timeFormatter = new TimeFormatter();

const Icon = () => {
  return (
    <svg height="20" width="20" viewBox="0 0 20 20">
      <path d="M4.516 7.548c0.436-0.446 1.043-0.481 1.576 0l3.908 3.747 3.908-3.747c0.533-0.481 1.141-0.446 1.574 0 0.436 0.445 0.408 1.197 0 1.615-0.406 0.418-4.695 4.502-4.695 4.502-0.217 0.223-0.502 0.335-0.787 0.335s-0.57-0.112-0.789-0.335c0 0-4.287-4.084-4.695-4.502s-0.436-1.17 0-1.615z"></path>
    </svg>
  );
};

const CloseIcon = () => {
  return (
    <svg height="20" width="20" viewBox="0 0 20 20">
      <path d="M14.348 14.849c-0.469 0.469-1.229 0.469-1.697 0l-2.651-3.030-2.651 3.029c-0.469 0.469-1.229 0.469-1.697 0-0.469-0.469-0.469-1.229 0-1.697l2.758-3.15-2.759-3.152c-0.469-0.469-0.469-1.228 0-1.697s1.228-0.469 1.697 0l2.652 3.031 2.651-3.031c0.469-0.469 1.228-0.469 1.697 0s0.469 1.229 0 1.697l-2.758 3.152 2.758 3.15c0.469 0.469 0.469 1.229 0 1.698z"></path>
    </svg>
  );
};

const PeoplePicker = ({ placeHolder, options, isMulti, onChange }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [selectedValue, setSelectedValue] = useState(isMulti ? [] : null);

  const handleInputClick = (e) => {
    setShowMenu(!showMenu);
  };

  const getDisplay = () => {
    if (!selectedValue || selectedValue.length === 0) {
      return placeHolder;
    }
    if (isMulti) {
      return (
        <div className="dropdown-tags">
          <div className="dropdown-tag-item">
            {selectedValue.length} User{selectedValue.length > 1 && "s"}
            <span
              onClick={(e) => onTagRemove(e)}
              className="dropdown-tag-close"
            >
              <CloseIcon />
            </span>
          </div>
        </div>
      );
    }
    return selectedValue.label;
  };
  const getTaskDuration = (isFormatted = false) => {
    if (!selectedValue || selectedValue.length === 0) {
      return isFormatted
        ? timeFormatter.formatToDuration(
            0,
            DURATION_FORMATS.CLASSIC_WITH_SECONDS
          )
        : 0;
    }
    const totalDuration = selectedValue.reduce(
      (partialSum, user) => partialSum + user.duration,
      0
    );
    return isFormatted
      ? timeFormatter.formatToDuration(
          totalDuration,
          DURATION_FORMATS.CLASSIC_WITH_SECONDS
        )
      : totalDuration;
  };
  const removeOption = (option) => {
    return selectedValue.filter((o) => o.value !== option.value);
  };

  const onTagRemove = (e) => {
    e.stopPropagation();
    setSelectedValue([]);
  };

  const onItemClick = (option) => {
    if (option.value === "all") {
      setSelectedValue(selectedValue.length == options.length ? [] : options);
      return;
    }
    let newValue;
    if (isMulti) {
      if (selectedValue.findIndex((o) => o.value === option.value) >= 0) {
        newValue = removeOption(option);
      } else {
        newValue = [...selectedValue, option];
      }
    } else {
      newValue = option;
    }
    setSelectedValue(newValue);
    // setShowMenu(false);
  };
  useEffect(onChange, [selectedValue]);

  const isSelected = (option) => {
    if (option.value === "all" && options.length === selectedValue.length)
      return true;
    if (isMulti) {
      return selectedValue.filter((o) => o.value === option.value).length > 0;
    }

    if (!selectedValue) {
      return false;
    }

    return selectedValue.value === option.value;
  };

  const getOptions = () => {
    const ALL_OPTION = { label: "All Users", value: "all" };
    return [ALL_OPTION, ...options];
  };

  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, () => {
    setShowMenu(false);
  });
  return (
    <div className="dropdown-stats-wrapper">
      <div className="dropdown-container">
        <div onClick={handleInputClick} className="dropdown-input">
          <div className="dropdown-selected-value">{getDisplay()}</div>
          <div className="dropdown-tools">
            <div className="dropdown-tool">
              <Icon />
            </div>
          </div>
        </div>
        {showMenu && (
          <div className="dropdown-menu" ref={wrapperRef}>
            {getOptions().map((option) => (
              <div
                onClick={() => onItemClick(option)}
                key={option.value}
                className={`dropdown-item ${isSelected(option) && "selected"}`}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <span
          className="timecamp-task-duration"
          data-duration={getTaskDuration()}
        >
          {getTaskDuration(true)}
        </span>
      </div>
    </div>
  );
};

export default PeoplePicker;
