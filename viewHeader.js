import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';

import Colors from '../styles/colors';

const ViewHeader = (props) => {
    const { title, leftButtonCb, rightButtonCb, headerStyles } = props;
    return (
        <View style={[styles.header, headerStyles]}>
            <TouchableOpacity style={styles.leftButton} onPress={leftButtonCb}>
                {props.children[0]}
            </TouchableOpacity>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity style={styles.rightButton} onPress={rightButtonCb}>
                {props.children[1]}
            </TouchableOpacity>
        </View>
    );
};

ViewHeader.propTypes = {
    title: PropTypes.string,
    leftButtonCb: PropTypes.func,
    rightButtonCb: PropTypes.func,
    headerStyles: PropTypes.number,
};

const styles = StyleSheet.create({
    header: {
        paddingTop: 20,
        height: 64,
        backgroundColor: Colors.back,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.lightGrey,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    leftButton: {
        position: 'absolute',
        left: 20,
        bottom: 8,
    },
    rightButton: {
        position: 'absolute',
        right: 20,
        bottom: 8,
    },
});

export default ViewHeader;
