import * as React from "react";
import TagPicker from '.';
import "./styles.scss";

const tagList = {
    1: {
        id: 1,
        name: "Test1",
        mandatory: false,
        tags: {1: {
            id: 1,
            name: "TestTaga1",
            mandatory: true
        },2 : {
            id: 2,
            name: "TestTaga2",
            mandatory: true
        }}
    },
    2: {
        id: 3,
        name: "Test3",
        mandatory: false,
        tags:
        {1: {
            id: 3,
            name: "jakis inny tag",
            mandatory: true
        },
        2: {
            id: 4,
            name: "jakis jeszcze inny tag",
            mandatory: false
        }
    }
    },
    6: {
        id: 7,
        name: "Test3",
        mandatory: true,
        tags:
        {8: {
            id: 9,
            name: "jakis inny tag",
            mandatory: false
        },
        10: {
            id: 999,
            name: "jakis jeszcze inny tag",
            mandatory: false
        }
    }
    },
    21: {
        id: 22,
        name: "Test3",
        mandatory: false,
        tags:
        {23: {
            id: 24,
            name: "jakis inny tag",
            mandatory: true
        },
        25: {
            id: 26,
            name: "jakis jeszcze inny tag",
            mandatory: false
        }
    }
    }
};

const browser = {
        runtime: {
            sendMessage: (data: object) => {
                console.log(data)
                return Promise.resolve(tagList);
            }
        }

};

export default <React.Fragment><TagPicker canCreateTags={true} browser={browser} taskId={1} handleSelectedTagsChange={(selectedTags: number[]) => {
    console.log(selectedTags);
}} handleTagsValidity={(isValid: boolean) => console.log(isValid)}/>
</React.Fragment>;
