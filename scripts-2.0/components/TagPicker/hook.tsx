import * as React from "react";
import { TagList } from '.';

export interface TagPickerHook {
    toggleTag: (tagId: number) => void,
    toggleTagList: (tagListId: number) => void,
    selectedTags: object,
    selectedTagLists: object,
    getSelectedTags: () => number[],
    tagLists: TagList[],
    setTagLists: (state: TagList[]) => any,
    isValid: boolean,
    setIsValid: (state: boolean) => any
}

export const useTagPickerHook = (
    ) => {
    const [selectedTagLists, setSelectedTagLists] = React.useState({});
    const [selectedTags, setSelectedTags] = React.useState({});
    const [isValid, setIsValid] = React.useState(true);

    const [tagLists, setTagLists] = React.useState<TagList[]>([]);

    const [searchText, setSearchText] = React.useState<string>('');

    const [isDisabled, setIsDisabled] = React.useState<boolean>(true);

    const toggleTag = (tagId:number): void => {
        selectedTags[tagId] = !selectedTags[tagId]
        setSelectedTags({...selectedTags});
    };

    const toggleTagList = (tagListId:number): void => {
        selectedTagLists[tagListId] = !selectedTagLists[tagListId];
        setSelectedTagLists({...selectedTagLists});
    };

    const getSelectedTags = (): number[] => {
        return Object.keys(selectedTags).filter((value) => selectedTags[value]).map((value) => parseInt(value));
    };

    const resetSelection = (): void => {
        setSelectedTags({});
        setSelectedTagLists({});
    }

    return {
        toggleTag,
        toggleTagList,
        getSelectedTags,
        setIsDisabled,
        setSearchText,
        setTagLists,
        setIsValid,
        resetSelection,
        searchText,
        tagLists,
        selectedTagLists,
        selectedTags,
        isValid,
        isDisabled
    };
};
