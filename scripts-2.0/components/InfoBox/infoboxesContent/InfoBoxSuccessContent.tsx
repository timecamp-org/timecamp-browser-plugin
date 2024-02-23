import * as React from "react";
import Icon from "../../Icon";
import { IconName } from "../../../icons/types";
import PathService from "../../../PathService"

const serverUrl = new PathService().getBaseUrl();

const InfoBoxSuccess = () => {
  return (
    <React.Fragment>
      <Icon name={IconName.CHECK_CIRCLE} iconPrefix={"fal"} />
      <span>&nbsp; Time entry added.&nbsp; </span>
      <a
        rel="noopener noreferrer"
        href={serverUrl}
        target="_blank"
      >
        <span>Edit in Timesheet.</span>
      </a>
    </React.Fragment>
  );
};

export default InfoBoxSuccess;
