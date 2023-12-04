import * as React from "react";
import {useState, useEffect} from "react";
import "./styles.scss";
import PeoplePicker from "../PeoplePicker";
import TimeFormatter from "../../TimeFormatter";
import browser from "webextension-polyfill";

const timeFormatter = new TimeFormatter();

const TotalUsersTimeInTaskComponent = ({
   taskId,
}) => {
    const [totalDuration, setTotalDuration] = useState(0);
    const [durationFormat, setDurationFormat] = useState<number>(timeFormatter.DEFAULT_FORMAT);

    useEffect(() => {
        // this is set to default format because of business requirement
        setDurationFormat(timeFormatter.DEFAULT_FORMAT);
    }, []);
    
    const updateDuration = async (selectedValues) => {
        if (!selectedValues || selectedValues.length === 0) {
            setTotalDuration(0);
            return;
        }

        const selectedValuesAsArray = selectedValues.map((e) => parseInt(e.value));
        const { data } = await browser.runtime.sendMessage({
            type: "fetchDetailedReport",
            useCache: true,
        });

        const sumWithInitial = data.reduce(
            (acc, currentValue) => {
                if (currentValue.taskId !== taskId) {
                    return acc;
                }
                if (!selectedValuesAsArray.includes(parseInt(currentValue.userId))) {
                    return acc;
                }
                return acc + currentValue.duration;
            },
            0
        );

        setTotalDuration(sumWithInitial);
    };

    return (
        <div className="tcUserStats">
            <PeoplePicker
                onChange={() => null}
                onClose={(selectedUsers) => updateDuration(selectedUsers)}
                onClear={() => updateDuration(null)}
            />
            <span className="tcUserStats__duration">
                {timeFormatter.formatToDuration(
                    totalDuration,
                    durationFormat
                )}
            </span>
        </div>
    );
};

export default TotalUsersTimeInTaskComponent;
