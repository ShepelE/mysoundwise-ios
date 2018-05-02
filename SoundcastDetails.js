import React, { Component } from 'react';
import { View, ScrollView, StyleSheet, Dimensions, Text } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';
import { CachedImage } from 'react-native-img-cache';

import { like, saveEpisodeProgress, setCurrentContainer, setModalShown, showSharingSheet } from '../../actions/index';
import Colors from '../../styles/colors';
import ViewHeader from '../../components/viewHeader';
import { downloadAudio, removeAudioFiles } from '../../actions/api';
import InnerTabs from '../../components/InnerTabs';
import { playFile, showPlayerBar, pauseSession } from '../../actions/play';
import EpisodePreview from './components/EpisodePreview';
import { getMixedEpisode, setPlayList } from '../../helpers/currentInstances';

const _windowWidth = Dimensions.get('window').width;
const _windowHeight = Dimensions.get('window').height;

class _SoundcastDetails extends Component {
    constructor (props) {
        super(props);

        this.state = {
            currentInnerTab: 0,
            backgroundImages: [],
            episodes: [],
            sharingVisible: false,
            shareOptions: {},
        };
        this.generateBackground(props);
        this.setEpisodes(props);

        this.showSharingSheet = this.showSharingSheet.bind(this);
    }

    componentWillReceiveProps (nextProps) {
        this.generateBackground(nextProps);
        this.setEpisodes(nextProps);
    }

    setEpisodes (props) {
        setTimeout(() => {
            const { user, currentPublisherId, containerPropsObj } = props;
            const { soundcastId } = containerPropsObj;

            let _episodes = [];
            if (!user.publishers || !user.publishers[currentPublisherId] || !soundcastId) {
                return;
            }
            let _soundcast = JSON.parse(JSON.stringify(user.publishers[currentPublisherId].soundcasts[soundcastId]));
            for (let id in _soundcast.episodes) {
                if (_soundcast.episodes.hasOwnProperty(id)) {
                    let episode = _soundcast.episodes[id];
                    // add some props to episode
                    getMixedEpisode(episode, this.props);
                    // generate array for view map
                    _episodes.push(episode);
                }
            }
            _episodes.sort((a, b) => {
                return b.date_created - a.date_created;
            });

            this.setState({episodes: _episodes});
        });
    }

    generateBackground (props) {
        // generate background
        // only if it isn't set yet
        if (
            this.state.backgroundImages.length === 0
            && props.user.publishers
            && props.user.publishers[props.currentPublisherId]
            && props.containerPropsObj.soundcastId
        ) {
            const _backgroundImages = []; // set background as array of images to cover all screen height
            for (let i = 0; i < _windowHeight / _windowWidth; i++) {
                _backgroundImages.push(
                    <CachedImage
                        key={i}
                        source={{uri: props.user.publishers[props.currentPublisherId].soundcasts[props.containerPropsObj.soundcastId].imageURL}}
                        blurRadius={30}
                        style={styles.backgroundImage}
                    />
                );
            }
            setTimeout(() => {
                this.setState({backgroundImages: _backgroundImages});
            });
        }
    }

    showTab (i) {
        this.setState({ currentInnerTab: i });
    }

    playEpisode (episode) {
        const { playFile, showPlayerBar, currentProgress, user, currentPublisherId, containerPropsObj } = this.props;
        const { soundcastId } = containerPropsObj;
        const _soundcast = user.publishers[currentPublisherId].soundcasts[soundcastId];
        const playListArray = setPlayList(_soundcast, this.props);
        const _index = playListArray.indexOf(episode);
        playFile(episode, currentProgress[episode.id], playListArray.splice(_index), user);
        showPlayerBar(true);
    }

    pauseEpisode (episode) {
        const { pauseSession, currentProgress, currentSessionStartedAt } = this.props;
        pauseSession(episode); // changes store state
        saveEpisodeProgress(episode, currentProgress, currentSessionStartedAt); // saves progress to firebase & postgres
    }

    showModal (episode, type) {
        const { setModalShown } = this.props;
        setModalShown({
            isModalShown: true,
            modalEpisode: episode,
            modalType: type,
            isTabsShown: false
        });
    }

    showSharingSheet(episodeId) {
        console.log('showSharingSheet called');
        this.setState({
            sharingVisible: true,
            shareOptions: {
                url: `https://mysoundwise.com/episodes/${episodeId}`
            }
        });
    }

    render () {
        const {
            user, currentPublisherId, isModalShown, downloadAudio, removeAudioFiles, setCurrentContainer, playing,
            containerPropsObj, isPlayerBarShown, showSharingSheet, isDownloading, files, paused, currentProgress
        } = this.props;
        const { currentInnerTab, episodes } = this.state;
        const { soundcastId } = containerPropsObj;
        // console.log('RENDER SoundcastDetails: ');

        let _subscribers = 0;
        if (!user.publishers || !user.publishers[currentPublisherId] || !soundcastId) {
            return null;
        }
        let _soundcast = user.publishers[currentPublisherId].soundcasts[soundcastId];
        if (_soundcast.subscribed) {
            _subscribers = Object.keys(_soundcast.subscribed).length;
        }
        const innerTabs = [
            {
                label: 'On Device',
                onPress: this.showTab.bind(this)
            },
            {
                label: 'All',
                onPress: this.showTab.bind(this)
            },
        ];

        return (
            <View style={[styles.container, {paddingBottom: (isPlayerBarShown || isModalShown) && 41 || 0}]}>
                <View style={styles.background}>
                    {
                        this.state.backgroundImages.map(image => image)
                    }
                </View>
                <ViewHeader
                    title=""
                    leftButtonCb={() => setCurrentContainer('Soundcasts')}
                    rightButtonCb={() => {}}
                    headerStyles={styles.header}
                >
                    <View style={styles.headerButton}>
                        <Icon name="angle-left" style={styles.backIcon}/>
                        <Text style={styles.backText}>Soundcasts</Text>
                    </View>
                    <View />
                </ViewHeader>
                <View style={styles.soundcastWrapper}>
                    <View style={styles.soundcastHeader}>
                        <View style={styles.soundcastIconWrapper}>
                            <CachedImage
                                source={{uri: _soundcast.imageURL}}
                                style={styles.courseIcon}
                            />
                        </View>
                        <View style={styles.headerContent}>
                            <Text style={styles.soundcastTitle} numberOfLines={3}>{_soundcast.title}</Text>
                            <Text style={styles.titleText}>{`${_subscribers} subscribers`}</Text>
                        </View>
                    </View>
                </View>
                <View>
                    <InnerTabs tabs={innerTabs} currentTab={currentInnerTab}/>
                </View>
                <ScrollView style={styles.content}>
                    {
                        episodes.map((episode, i) => {
                            episode.path = files[episode.id];
                            episode.isPlaying = playing[episode.id];
                            episode.isPaused = paused[episode.id];
                            episode.progress = currentProgress[episode.id];
                            episode.isSoundLoading = isDownloading[episode.id];
                            if (currentInnerTab === 0 && episode.path || currentInnerTab === 1 && episode.id) {
                                return (
                                    <EpisodePreview
                                        key={i}
                                        episode={episode}
                                        setCurrentContainer={setCurrentContainer}
                                        like={like}
                                        downloadAudio={downloadAudio}
                                        onShowModal={this.showModal.bind(this)}
                                        removeAudioFiles={removeAudioFiles}
                                        onPlayCallback={this.playEpisode.bind(this, episode)}
                                        onPauseCallback={this.pauseEpisode.bind(this, episode)}
                                        mode={innerTabs[currentInnerTab].label}
                                        isEpisodePlaying={!!(playing[episode.id])}
                                        showSharingSheet={showSharingSheet}
                                    />
                                );
                            } else {
                                return null;
                            }
                        })
                    }
                </ScrollView>
            </View>
        )
    }
}

_SoundcastDetails.propTypes = {
    user: PropTypes.object,
    isDownloading: PropTypes.object, // for getMixedEpisode
    downloadProgress: PropTypes.object, // for getMixedEpisode
    files: PropTypes.object, // for getMixedEpisode
    like: PropTypes.func,
    downloadAudio: PropTypes.func,
    noteFiles: PropTypes.object, // for getMixedEpisode
    removeAudioFiles: PropTypes.func, // for getMixedEpisode
    navigation: PropTypes.object,
    playFile: PropTypes.func,
    showPlayerBar: PropTypes.func,
    pauseSession: PropTypes.func,
    episodePlayingId: PropTypes.string,
    currentProgress: PropTypes.object, // for getMixedEpisode
    playing: PropTypes.object, // for getMixedEpisode
    paused: PropTypes.object, // for getMixedEpisode
    isPlayerBarShown: PropTypes.bool,
    currentPublisherId: PropTypes.string, // for getMixedEpisode
    currentSessionStartedAt: PropTypes.number,
    setCurrentContainer: PropTypes.func,
    containerPropsObj: PropTypes.object,
    setModalShown: PropTypes.func,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingBottom: 50,
    },
    background: {
        position: 'absolute',
        width: _windowWidth,
        height: _windowHeight,
        zIndex: -1,
    },
    backgroundImage: {
        opacity: 0.5,
        width: _windowWidth,
        height: _windowWidth,
    },

    header: {
        backgroundColor: 'transparent',
        borderBottomWidth: 0,
    },
    headerButton: {
        flexDirection: 'row',
    },
    backIcon: {
        fontSize: 40,
        color: Colors.navBlue,
        marginLeft: -9,
    },
    backText: {
        fontWeight: 'bold',
        fontSize: 20,
        color: Colors.navBlue,
        marginLeft: 10,
        marginTop: 10,
    },

    soundcastWrapper: {
        paddingLeft: 12,
        paddingRight: 12,
        paddingBottom: 5,
        paddingTop: 17,
        borderTopWidth: 1,
        borderTopColor: Colors.lightGrey,
        bottom: 1,
    },
    soundcastHeader: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
    },
    soundcastIconWrapper: {
        width: 77,
        height: 77,
        shadowRadius: 4,
        shadowColor: Colors.mainBlack,
        shadowOpacity: 0.5,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        marginBottom: 5,
        backgroundColor: Colors.mainWhite,
    },
    courseIcon: {
        width: 77,
        height: 77,
    },
    headerContent: {
        paddingLeft: 15,
        paddingRight: 0,
    },
    soundcastTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: Colors.mainBlack,
        width: _windowWidth - 77 - 64,
        height: 60,
    },
    titleText: {
        fontSize: 13,
        color: Colors.mainBlack,
        width: _windowWidth - 77 - 64,
    },

    content: {
        marginBottom: 50,
        zIndex: 1,
    },
});

function mapStateToProps (store) {
    return {
        currentPublisherId: store.user.currentPublisherId,
        user: store.user.user,
        isDownloading: store.audioPaths.isDownloading,
        downloadProgress: store.audioPaths.downloadProgress,
        files: store.audioPaths.files,
        noteFiles: store.imagePaths.episodeNoteFiles,
        episodePlayingId: store.playerState.episodePlayingId,
        currentProgress: store.playerState.currentProgress,
        playing: store.playerState.playing,
        paused: store.playerState.paused,
        isPlayerBarShown: store.playerState.isPlayerBarShown,
        currentSessionStartedAt: store.playerState.currentSessionStartedAt,
        containerPropsObj: store.user.containerPropsObj,
    };
}


function mapDispatchToProps (dispatch) {
    return bindActionCreators({
        playFile, showPlayerBar, pauseSession, downloadAudio, removeAudioFiles, setCurrentContainer, setModalShown, showSharingSheet
    }, dispatch)
}

export const SoundcastDetails = connect(mapStateToProps, mapDispatchToProps)(_SoundcastDetails);
