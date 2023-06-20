import AudioRecorderPlayer, {
  AudioEncoderAndroidType,
  AudioSet,
  AudioSourceAndroidType,
  AVEncoderAudioQualityIOSType,
  AVEncodingOption,
  OutputFormatAndroidType,
  PlayBackType,
} from 'react-native-audio-recorder-player'
import { PermissionsAndroid, Platform } from 'react-native'
import { TTS_FILE_PATH, VOICE_RECORD_PATH } from '../utils/constants'
import RNFetchBlob from 'rn-fetch-blob'

const audioRecorder = new AudioRecorderPlayer()

export const requestRecordPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const grants = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ])

      if (
        grants['android.permission.WRITE_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        grants['android.permission.READ_EXTERNAL_STORAGE'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        grants['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        return true
      } else {
        console.warn('Some of required permissions not granted')
      }
    } catch (e) {
      console.warn(`Request record permission failed: ${e}`)
    }
    return false
  }
}

export const startRecorder = async (path: string) => {
  await requestRecordPermission()
  const audioSet: AudioSet = {
    AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
    AudioSourceAndroid: AudioSourceAndroidType.MIC,
    AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
    AVNumberOfChannelsKeyIOS: 2,
    AVFormatIDKeyIOS: AVEncodingOption.aac,
    OutputFormatAndroid: OutputFormatAndroidType.MPEG_4,
  }
  const uri = await audioRecorder.startRecorder(path, audioSet)
  return uri
}

export const stopRecorder = async () => {
  return audioRecorder.stopRecorder()
}

export const startPlayer = async (filePath: string) => {
  const exist = await RNFetchBlob.fs.exists(filePath)
  if (!exist) {
    throw new Error('Failed to get tts file')
  }
  await audioRecorder.stopPlayer()
  return audioRecorder.startPlayer(filePath)
}

export const stopPlayer = () => audioRecorder.stopPlayer()

export const addPlayerListener = (fn: (e: PlayBackType) => void) => {
  audioRecorder.addPlayBackListener(fn)
}

export const removePlayerListener = () => {
  audioRecorder.removePlayBackListener()
}
