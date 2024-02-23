import * as React from "react";
import "./styles.scss";
import { InfoBoxStatus } from "./types";
import InfoboxesContent from "./infoboxesContent";

interface InfoBoxProps {
  children?: React.ReactNode;
  onClose: () => void;

  status: InfoBoxStatus | undefined;
}

const contentByStatus = {
  [InfoBoxStatus.SUCCESS]: <InfoboxesContent.success />,
  [InfoBoxStatus.ERROR]: <InfoboxesContent.error />,
};

const InfoBox = ({ onClose, status, children = null }: InfoBoxProps) => {
  if (!status) return null;

  const selectedContent = contentByStatus[status] || null;

  return (
    <div className="infobox" data-status={status}>
      {selectedContent}
      {children}

      <span className="infobox__cross" onClick={onClose}>
        X
      </span>
    </div>
  );
};

export default InfoBox;
