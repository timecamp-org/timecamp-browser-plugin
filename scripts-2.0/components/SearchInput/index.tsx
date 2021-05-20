import * as React from 'react';
import { IconName } from '../../icons/types';
import Icon from '../Icon';
import { useSearchInputHook } from './hook';

import './styles.scss';

export interface SearchInputInterface {
  debounce?: number;
  withIcon?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const SearchInput: React.FC<SearchInputInterface> = (props) => {

  const hook = useSearchInputHook(props);
  return (
    <div className="SearchInput">
      {props.withIcon && <Icon className="SearchInput__icon" name={IconName.SEARCH} />}
      <input
        className={`
          SearchInput__input
          ${props.withIcon ? 'SearchInput__input--with-icon' : ''}
        `}
        type="text"
        placeholder={props.placeholder}
        onChange={hook.onChange}
        disabled={false}
        autoFocus={true}
      />
    </div>
  );
}

export default SearchInput;