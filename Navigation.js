// Navigation is the root component of app that's exported to index.ios.js
import React, { Component } from 'react';
import { Provider } from 'react-redux';
import firebase from 'react-native-firebase';
import Orientation from 'react-native-orientation-locker';
import codePush from "react-native-code-push";

import { Welcome } from './containers/welcome/Welcome';
import { Signup } from './containers/signup/SignupScreen';
import { App } from './containers/App';
import { PublishersList } from './containers/publishersList/PublishersList';

import { store, persistor } from './store';
import { StackNavigator } from 'react-navigation';
import { config } from '../firebase_config';

const Router = StackNavigator(
    {
        Welcome: { screen: Welcome },
        App: { screen: App },
        Signup: { screen: Signup },
        PublishersList: { screen: PublishersList }
    },
    {
        headerMode: 'none',
    }
);

firebase.initializeApp(config);

class _Navigation extends Component {

    componentDidMount() {
        Orientation.lockToPortrait();
    }

    render() {
        return (
            <Provider store = { store } persistor = { persistor }>
                <Router />
            </Provider>
        )
    }
}

export const Navigation = codePush(_Navigation);
