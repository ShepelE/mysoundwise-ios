import { createStore, compose, applyMiddleware } from 'redux'
import {persistStore, autoRehydrate } from 'redux-persist';
import thunk from 'redux-thunk';
import { AsyncStorage } from 'react-native';
import rootReducer from './reducers';

const persistConfig = {
    storage: AsyncStorage,
    blacklist: ['currentCourses'],
};

export const store = createStore(
    rootReducer,
    {},
    compose(
        applyMiddleware(thunk),
        autoRehydrate()
    )
);

export const persistor = persistStore(store, persistConfig, () => {
    console.log('store -> rehydration complete');
});
