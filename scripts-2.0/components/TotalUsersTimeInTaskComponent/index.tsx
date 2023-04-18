import * as React from "react";
import {useState, useEffect} from "react";
import "./styles.scss";
import PeoplePicker from "../PeoplePicker";
import TimeFormatter from "../../TimeFormatter";
import browser from "webextension-polyfill";

const timeFormatter = new TimeFormatter();

const TotalUsersTimeInTaskComponent = (
    {
        externalTaskId,
    }) => {
    
    const [totalDuration, setTotalDuration] = useState(0);
    const [timeEntries, setTimeEntries] = useState([]);
    const [durationFormat, setDurationFormat] = useState<number>(timeFormatter.DEFAULT_FORMAT);

    useEffect(() => {
        browser.runtime
            .sendMessage({ type: "getUsers", cacheKey: 'users' })
            .then((users) => {
                let usersIds = users.map((el) => {
                    return el.user_id;
                });

                browser.runtime
                    .sendMessage({
                        type: "getUsersTimeEntries",
                        userIds: usersIds,
                        cacheKey: ['usersTimeEntries', usersIds].join('_'),
                    })
                    .then((response) => {
                        setTimeEntries(response);
                    });
            });

        browser.runtime.sendMessage({
            type: 'getDurationFormatFromStorage'
        }).then((valueOfDurationFormat) => {
            setDurationFormat(valueOfDurationFormat);
        }).catch(() => {
        });
    }, []);
    
    const updateDuration = (selectedValues) => {
        if (!selectedValues || selectedValues.length === 0) {
            setTotalDuration(0);
            return Promise.resolve();
        }

        let selectedUsersIds = selectedValues.map((el) => el.value);
        const timeEntriesForSelectedUsers = timeEntries.filter((timeEntry) => {
            // @ts-ignore
            return selectedUsersIds.includes(timeEntry.user_id);
        });

        const totalDuration = timeEntriesForSelectedUsers
            .filter(
                // @ts-ignore
                (x) => x.addons_external_id == externalTaskId
            )
            .reduce(
                (partialSum, user) => {
                    // @ts-ignore
                    return partialSum + user.duration * 1
                }, 0
            );

        setTotalDuration(totalDuration);
    };

    return (
        <div className="tcUserStats">
            <PeoplePicker
                onChange={(selectedUsers) => updateDuration(selectedUsers)}
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
