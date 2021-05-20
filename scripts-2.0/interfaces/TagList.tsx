import Tag from "./Tag"

export interface TagList {
    tags: Array<Tag>,
    mandatory: boolean,
    tagListId: number,
    tagListName: string,
    isSelected: boolean
    onChange: (tagListId: number) => void
}

export default TagList;