import * as React from 'react';
import SearchInput from '.';

import '../../icons';

export default <SearchInput
  onChange={(event) => { console.log(event.target.value) }}
  debounce={100}
  withIcon={true}
/>;
