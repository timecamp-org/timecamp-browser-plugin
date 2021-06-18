import * as React from 'react';


export interface DropdownHookInterface {
  isOpen: boolean;
  buttonRef: React.MutableRefObject<null | HTMLDivElement>;

  setIsOpen: (isOpen: boolean) => void;

  calculateDropdownPosition: () => {
    top: number,
    left: number,
    width: number
  };
  onDropdownButtonClick: (e) => void;
  onBackdropClick: (e) => void;
}

export const useDropdownHook = (): DropdownHookInterface => {
  const [isOpen, setIsOpen] = React.useState(false);
  const buttonRef = React.useRef<null | HTMLDivElement>(null);

  const onDropdownButtonClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const onBackdropClick = (e) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  const calculateDropdownPosition = () => {
    let top = 0;
    let left = 0;
    let width = 0;

    if (buttonRef) {
      const tmp = buttonRef.current?.getBoundingClientRect();

      if (tmp) {
        const { x, y, height } = tmp;

        top = y + height + 10;
        left = x;
        width = tmp.width;
      }
    }

    return {
      top,
      left,
      width
    };
  };

  return {
    isOpen,
    setIsOpen,
    buttonRef,

    calculateDropdownPosition,
    onDropdownButtonClick,
    onBackdropClick,
  };
};
