import * as React from "react";

import "./styles.scss";

const DurationSelector = (props) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="duration-selector">
      <label>
        <small>{props.label}</small>

        <div className="duration-selector__input-wrapper">
          <input
            ref={inputRef}
            className="duration-selector__input-wrapper__input"
            value={props.value}
            onKeyDown={(e) => {
              if (!inputRef.current) {
                return;
              }

              let selectionEnd = inputRef.current.selectionEnd as number;

              if (e.key === "Tab") {
                return;
              }      

              if(e.key ==='ArrowLeft' || e.key==='ArrowRight'){
            
                const newSelection = e.key==='ArrowLeft'? selectionEnd -1 : selectionEnd +1
                const textLength = inputRef.current.value
                const result = newSelection > textLength.length  ? 0 : newSelection
                inputRef.current.setSelectionRange(result, result)
              }

              if (e.key === "Backspace") {
                inputRef.current.setSelectionRange(0, 0);
                e.preventDefault();
                return;
              }

              const key = e.key;

              const keyIsValid =
                e.key.length === 1 &&
                Array.from({ length: 10 }, (_, i) =>
                  i.toString().charCodeAt(0),
                ).includes(e.key.toString().charCodeAt(0));
              if (!keyIsValid) {
                e.preventDefault();
                return;
              }              

              if (selectionEnd > 1) {
                inputRef.current.setSelectionRange(0, 0);
                selectionEnd = 0;
              }

              const value = inputRef.current?.value;

              const start = value?.substring(0, selectionEnd);
              const end = value?.substring(selectionEnd + 1);
              const result = `${start}${key}${end}`;

              inputRef.current.value = result;
              const newSelectionIndex =
                selectionEnd === 1 ? 5 : selectionEnd + 1;
              inputRef.current.setSelectionRange(
                newSelectionIndex,
                newSelectionIndex,
              );
              props.onChange(result);
              e.preventDefault();
            }}
          />
        </div>
      </label>
    </div>
  );
};

export default DurationSelector;
