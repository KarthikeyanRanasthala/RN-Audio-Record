import React from "react";
import { Button, Text, View } from "react-native";
import { Audio } from "expo-av";

// For asking permissions
import * as Permissions from "expo-permissions";

// For accessing to filesystem
import * as FileSystem from "expo-file-system";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      haveRecordingPermission: false
    };
    this.recordingSettings = Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY;
  }

  _askForPermissions = async () => {
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);

    // setState to true, if response.status is granted. else setState to false
    this.setState({
      haveRecordingPermission: response.status === "granted"
    });
  };

  componentDidMount() {
    this._askForPermissions();
  }

  startRecord = async () => {
    console.log("start");

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(this.recordingSettings);

    this.recording = recording;
    await this.recording.startAsync();
  };

  stopRecording = async () => {
    console.log("stop");

    try {
      await this.recording.stopAndUnloadAsync();
    } catch (error) {
      console.log(error);
    }

    const info = await FileSystem.getInfoAsync(this.recording.getURI());
    console.log(`FILE INFO: ${JSON.stringify(info)}`);

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      playsInSilentLockedModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true
    });
    const { sound } = await this.recording.createNewLoadedSoundAsync();

    sound.playAsync();
  };

  render() {
    if (!this.state.haveRecordingPermission) {
      return <Text>No permission to record</Text>;
    }

    return (
      <View>
        <Button title="Start" onPress={this.startRecord} />
        <Button title="Stop" onPress={this.stopRecording} />
      </View>
    );
  }
}

export default App;
