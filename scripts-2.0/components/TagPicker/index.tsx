import * as React from "react";
import ReactHtmlParser from "react-html-parser";
import Checkbox from "../Checkbox/Checkbox";
import Dropdown from "../Dropdown";
import { useDropdownHook } from "../Dropdown/hook";
import SearchInput from "../SearchInput";
import { useTagPickerHook } from "./hook";
import Logger from '../../Logger';
import translate from "../../Translator";
import './styles.scss';

export interface Tag {
    tagId: number,
    tagName: string,
    mandatory: boolean
}

export interface TagList {
    tags: Tag[],
    mandatory: boolean,
    tagListId: number,
    tagListName: string
}

export interface TagPicker {
    handleSelectedTagsChange: (selectedTags: number[]) => void,
    handleTagsValidity: (isValid: boolean) => void,
    browser: any,
    canCreateTags: boolean,
    taskId?: number
}

const logger = new Logger();

const TagPicker: React.FC<TagPicker> = (props) => {
    const tagPickerHook = useTagPickerHook();
    const dropdownHook = useDropdownHook();

    const onTagListClick = (tagList: TagList) => {
        tagPickerHook.toggleTagList(tagList.tagListId);
        let isSelected = tagPickerHook.selectedTagLists[tagList.tagListId];
        tagList.tags.forEach(tag => {
            if(isSelected !== tagPickerHook.selectedTags[tag.tagId]) {
                tagPickerHook.toggleTag(tag.tagId);
            }
        });
        props.handleSelectedTagsChange(tagPickerHook.getSelectedTags());
    };

    const checkTagListCheckedIntegrity = (tag: Tag): void => {
        tagPickerHook.tagLists.forEach(tagList => {
            if (tagList.tags.indexOf(tag) !== -1) {
                if(tagPickerHook.selectedTagLists[tagList.tagListId] && !tagPickerHook.selectedTags[tag.tagId]
                    || (
                        !tagPickerHook.selectedTagLists[tagList.tagListId]
                        && tagList.tags.filter((tag) => !tagPickerHook.selectedTags[tag.tagId]).length === 0
                        )
                    ) {
                    tagPickerHook.toggleTagList(tagList.tagListId);
                }
            }
        });
    };

    const checkIfMandatoryTagsListChecked = (autoCheckSingleMandatoryTag: boolean = false): boolean => {
        let valid = true;
        tagPickerHook.tagLists.forEach(tagList => {
            if(tagList.mandatory && !isMandatoryTagListChecked(tagList, autoCheckSingleMandatoryTag)
                || !tagList.mandatory && !isNotMandatoryTagListChecked(tagList, autoCheckSingleMandatoryTag)
            ) {
                valid = false;
            }
        });

        return valid;
    };

    const isNotMandatoryTagListChecked = (tagList: TagList, autoCheckSingleMandatoryTag: boolean = false) => {
        let mandatoryTags = tagList.tags.filter((tag: Tag) => tag.mandatory);
        if(mandatoryTags.length > 1) {
            return mandatoryTags.filter((tag: Tag) => tagPickerHook.selectedTags[tag.tagId]).length > 0;
        }

        if (mandatoryTags.length === 1 ) {
            if(autoCheckSingleMandatoryTag && !tagPickerHook.selectedTags[mandatoryTags[0].tagId]) {
                tagPickerHook.toggleTag(mandatoryTags[0].tagId);
                checkTagListCheckedIntegrity(mandatoryTags[0]);
            }
            return tagPickerHook.selectedTags[mandatoryTags[0].tagId];
        }

        return true;
    };

    const isMandatoryTagListChecked = (tagList: TagList, autoCheckSingleMandatoryTag: boolean = false): boolean => {
        let checked = false;
        if(tagList.tags.length > 1) {
            tagList.tags.forEach(function(tag: Tag) {
                if(tagPickerHook.selectedTags[tag.tagId]) {
                    checked = true;
                }
            });
        } else {
            tagList.tags.forEach(function(tag: Tag) {
                if(autoCheckSingleMandatoryTag && !tagPickerHook.selectedTags[tag.tagId]) {
                    tagPickerHook.toggleTag(tag.tagId);
                    checkTagListCheckedIntegrity(tag);
                }
                checked = tagPickerHook.selectedTags[tag.tagId];
            });
        }
        return checked;
    };

    const onTagClick = (tag: Tag) => {
        tagPickerHook.toggleTag(tag.tagId);
        checkTagListCheckedIntegrity(tag);
        props.handleSelectedTagsChange(tagPickerHook.getSelectedTags());
    };

    const renderTagList = (tagList: TagList) => {
        return <React.Fragment key={tagList.tagListId}>
            <div className="TagPicker__TagList" onClick={() => onTagListClick(tagList)}>
                <Checkbox isChecked={tagPickerHook.selectedTagLists[tagList.tagListId]}/>
                <span className="TagPicker__TagList__label">{tagList.tagListName}</span>
                {tagList.mandatory ? renderMandatory() : ""}
            </div>
            {tagList.tags.map((tag) => renderTag(tag) )}
        </React.Fragment>
    };

    const renderTag = (tag: Tag) => {
        return <React.Fragment>
            <div key={tag.tagId} className="TagPicker__TagRow" onClick={() => {
                onTagClick(tag);
            }}>
                <Checkbox isChecked={tagPickerHook.selectedTags[tag.tagId]}/>
                <span  className="TagPicker__TagRow__label">{tag.tagName}</span>
                {tag.mandatory ? renderMandatory() : ""}
            </div>
        </React.Fragment>
    };

    const renderMandatory = () => {
        return <div className="TagPicker__mandatory">{translate('mandatory')}</div>;
    };

    const fetchTags = () : void => {
        props.browser.runtime.sendMessage({
            type: "getTagLists",
            tags: 1,
            archived: 0,
            useRestrictions: 1,
            taskId: props.taskId,
            sortedArray: 1
        }).then((data: any) => {
            tagPickerHook.setTagLists((Object.values(data).map((tagList: any) => {
                    return {
                        tagListName: tagList.name,
                        tagListId: tagList.id,
                        tags: Object.values(tagList.tags).map((tag: any) => {
                            return {
                                tagId: tag.id,
                                tagName: tag.name,
                                mandatory: parseInt(tag.mandatory) === 1
                            } as Tag;
                        }),
                        mandatory: parseInt(tagList.mandatory) === 1
                } as TagList
            })));
        }).catch((e)=>{logger.log(e);});
    };

    const submit = (): void => {
        let valid = checkIfMandatoryTagsListChecked(true);
        tagPickerHook.setIsValid(valid);

        props.handleSelectedTagsChange(tagPickerHook.getSelectedTags());

        //the state is not updated immediatly, so the variable had to be introduced
        props.handleTagsValidity(valid);
        dropdownHook.setIsOpen(false);
    };

    const onSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        tagPickerHook.setSearchText(event.target.value);
    };

    const renderTagListFilteredBySearchText = () => {
        if(tagPickerHook.searchText.length < 2) {
            return tagPickerHook.tagLists;
        }
        return filterTagListsByTagCondition(
            (tag: Tag, tagList: TagList) =>
              tag.tagName.toLowerCase().indexOf(tagPickerHook.searchText.toLowerCase()) !== -1 ||
              tagList.tagListName.toLowerCase().indexOf(tagPickerHook.searchText.toLowerCase()) !== -1
        );
    };

    const filterTagListsByTagCondition = (conditionCallback: (tag:Tag, tagList: TagList) => boolean) => {
        return tagPickerHook.tagLists.map((tagList: TagList) => {
            return {
                tagListId: tagList.tagListId,
                tagListName: tagList.tagListName,
                mandatory: tagList.mandatory,
                tags: tagList.tags.filter((tag) => conditionCallback(tag, tagList))
            } as TagList
        })
            .filter((tagList: TagList) => tagList.tags.length > 0);
    };

    const renderTagPickerContent = () => {
        const filteredTagList = renderTagListFilteredBySearchText();
        return <React.Fragment>
            <div className="TagPicker__content">
                <div className="TagPicker__search_container">
                    <SearchInput debounce={500} placeholder={translate('search')} onChange={onSearchInputChange} />
                </div>
                <div className="TagPicker__list">
                    {filteredTagList.length !== 0 && renderTagPickerLabel()}
                    {filteredTagList.length !== 0 && filteredTagList.map((tagList) => renderTagList(tagList))}
                    {filteredTagList.length === 0 && tagPickerHook.searchText.length > 0 && renderNotFound()}
                    {filteredTagList.length === 0 && tagPickerHook.searchText.length === 0 && renderNoTag()}
                </div>
                {filteredTagList.length !== 0
                    && <div className={"TagPicker__button_container"}>
                        <div className="TagPicker__button" onClick={(e) => {
                            e.stopPropagation();
                            submit();
                        }}>
                            {translate('apply')}
                        </div>
                    </div>
                }
            </div>
        </React.Fragment>;
    };

    const renderNotFound = () => {
        return <div className="TagPicker__not_found">
        <img className="TagPicker__not_found_image" src={require('../../../images/no-results.svg')} />
        <div className="TagPicker__not_found_text">{translate('no_results_found')}</div>
    </div>;
    };

    const renderNoTag = () => {
        return <div className="TagPicker__no_tags">
            <div className="TagPicker__no_tags_label">
                {translate('no_tags_added_label')}
            </div>
            <div className="TagPicker__no_tags_text">{
                props.canCreateTags ? ReactHtmlParser((translate('no_tags_added_message_administrator')
                        .replace('*linkStart*', "<a target='_blank' href='" + process.env.SERVER_PROTOCOL + '://' + process.env.SERVER_DOMAIN + '/' + "app#/settings/addons/tags'>")
                        .replace('*linkClose*', '</a>')
                    ))
                : translate('no_tags_added_message_user')
            }</div>
        </div>;
    };

    const renderTagPickerLabel = () => {
        return <div className="TagPicker__label">
            {translate('tags')}
        </div>;
    };

    const renderInvalidMessage = () => {
        return <div className="TagPicker__invalid">{translate('select_at_least_one_mandatory_tag')}</div>;
    };

    const renderSelectedTagsNames = () => {
        if (!props.taskId) {
            return <span className={"TagPicker__TagList__label__disabled"}>{translate('select_task_to_see_tags')}</span>;
        }
        let tagNames = filterTagListsByTagCondition((tag: Tag) => tagPickerHook.selectedTags[tag.tagId]);
        return tagNames.length ? tagNames.map((tagList: TagList) => {
                    return <React.Fragment>
                        <span className="TagPicker__TagList__label">{tagList.tagListName}: </span><span>{tagList.tags.map((tag:Tag) => tag.tagName).join(', ')} </span>
                    </React.Fragment>
        }) : <span className={"TagPicker__TagList__label__disabled"}>{translate('select_tags')}</span>;
    };

    React.useEffect(() => {
        tagPickerHook.resetSelection();
        tagPickerHook.setIsDisabled(true);

        dropdownHook.setIsOpen(false);
        if (props.taskId) {
            fetchTags();
        } else {
            tagPickerHook.setTagLists([]);
        }
    }, [props.taskId]);

    React.useEffect(() => {
        const valid = checkIfMandatoryTagsListChecked();

        tagPickerHook.setIsValid(valid);
        if (tagPickerHook.tagLists.length > 0) {
            tagPickerHook.setIsDisabled(false);
        }

        props.handleTagsValidity(valid);
        props.handleSelectedTagsChange(tagPickerHook.getSelectedTags());

    }, [tagPickerHook.tagLists]);

    React.useEffect(() => {
        if(dropdownHook.isOpen) {
            tagPickerHook.setSearchText("");
        }
    }, [dropdownHook.isOpen]);

    return <React.Fragment>
        <Dropdown
        isOpen={dropdownHook.isOpen}
        additionalClass={["TagPicker__dropdown", ...(tagPickerHook.isValid ? "" : ["TagPicker__dropdown__invalid"])]}
        children={renderTagPickerContent()}
        text={renderSelectedTagsNames()}
        onDropdownButtonClick={dropdownHook.onDropdownButtonClick}
        isDisabled={tagPickerHook.isDisabled}
        onBackdropClick={dropdownHook.onBackdropClick} />
        {!tagPickerHook.isValid && !dropdownHook.isOpen && renderInvalidMessage()}
    </React.Fragment>
};

export default TagPicker;
