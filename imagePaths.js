import * as types from '../actions/types';
import {REHYDRATE} from 'redux-persist/constants';

const imagePaths = (state = {
    courseFiles: {},
    episodeNoteFiles: {},
}, action) => {
    switch(action.type) {
        case types.SECTION_FILES_DOWNLOADED:
            return {
                ...state,
                episodeNoteFiles: Object.assign({}, state.episodeNoteFiles, action.payload),
            };
        case types.REMOVE_FILES:
            const _episodeNoteFiles = JSON.parse(JSON.stringify(state.episodeNoteFiles));
            action.payload.map(path => {
                for (let key in _episodeNoteFiles) {
                    if (_episodeNoteFiles[key] === path) {
                        delete _episodeNoteFiles[key];
                    }
                }
            });
            return {
                ...state,
                episodeNoteFiles: _episodeNoteFiles,
            };
        case REHYDRATE:
            let incoming = action.payload.imagePaths;
            if(incoming) {
                return {
                    ...state,
                    ...incoming
                };
            } else {
                return state;
            }
        default:
            return state;
    }
};

export default imagePaths;
