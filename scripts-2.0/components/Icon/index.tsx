import * as React from 'react';

import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { IconName } from '../../icons/types';
import { IconPrefix } from '@fortawesome/pro-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

export interface PropTypes extends Partial<FontAwesomeIconProps> {
  className?: string;

  width?: string | number;
  height?: string | number;

  name?: IconName;
  iconPrefix: IconPrefix;
}

const defaultProps: PropTypes = {
  className: '',

  iconPrefix: 'fas',
};

function Icon(props: PropTypes) {

  if (!props.name) {
    return null;
  }

  const { name, iconPrefix, ...iconProps } = props;

  return (
    <FontAwesomeIcon
      {...iconProps}
      icon={[iconPrefix, name] as IconProp}
    />
  );
}

Icon.defaultProps = defaultProps;

export default Icon;
