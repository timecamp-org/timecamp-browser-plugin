import * as React from "react";
import translate from "../../Translator";

import './styles.scss';
import {useEffect, useState} from "react";

export interface NoteInterface {
    note: string,
    onNoteChange(newNote: string): any
}

const Note: React.FC<NoteInterface> = (props) => {
    const [note, setNote] = useState(props.note);
    const maxNoteLength = 1024;

    useEffect(() => {
        setNote(props.note);
    }, [props.note]);
    
    const onChange = (e) => {
        const noteValue = e.target.value;
        
        setNote(noteValue);
        props.onNoteChange(noteValue)
    }

    return (
        <div className={'note'}>
            <label className={'note__label'}>{translate('note')}</label>
            <p className={'note__counter'}>{note.length}/{maxNoteLength}</p>
            <textarea
                className={'note__textarea'}
                value={note}
                onChange={onChange}
                maxLength={maxNoteLength}
                placeholder={translate('add_notes')}
            />
        </div>
    );
}

export default Note;
