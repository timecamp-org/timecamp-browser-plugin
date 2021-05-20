export interface Tag {
    tagId: number,
    tagName: string,
    mandatory: boolean,
    isSelected: boolean,
    onChange: (tagId: number) => void
};

export default Tag;