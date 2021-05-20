import { ChangeEvent } from 'react'
import { SearchInputInterface } from '.'

export interface SearchInputHookInterface {
  onChange: (InputEvent) => void;
}

export const useSearchInputHook = (
  props: SearchInputInterface
) => {

  let debounceTimeout: number | null = null;

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    if (props.debounce) {
      debounceTimeout = window.setTimeout(() => {
        props.onChange(event);
      }, props.debounce);
    } else {
      props.onChange(event);
    }
  }

  return {
    onChange,
  }
}