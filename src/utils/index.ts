import { getTTSBlobFile } from '../services/api'
import RNFetchBlob from 'rn-fetch-blob'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { TTS_ROLE_KEY } from './constants'

export const MICROSOFT_TTS_ROLES = [
  'en-US-EricNeural',
  'zh-cn-XiaoxiaoNeural',
  'zh-CN-XiaochenNeural',
  'zh-CN-XiaohanNeural',
  'zh-CN-XiaomengNeural',
  'zh-CN-XiaomoNeural',
  'zh-CN-XiaoqiuNeural',
  'zh-CN-XiaoruiNeural',
  'zh-CN-XiaoshuangNeural',
  'zh-CN-XiaoxuanNeural',
  'zh-CN-XiaoyanNeural',
  'zh-CN-XiaoyiNeural',
  'zh-CN-XiaoyouNeural',
  'zh-CN-XiaozhenNeural',
  'zh-CN-YunfengNeural',
  'zh-CN-YunhaoNeural',
  'zh-CN-YunjianNeural',
  'zh-CN-YunxiaNeural',
  'zh-CN-YunxiNeural',
  'zh-CN-YunyangNeural',
  'zh-CN-YunyeNeural',
  'zh-CN-YunzeNeural',
  'en-US-AIGenerate1Neural',
  'en-US-AIGenerate2Neural',
  'en-US-AmberNeural',
  'en-US-AnaNeural',
  'en-US-AriaNeural',
  'en-US-AshleyNeural',
  'en-US-BrandonNeural',
  'en-US-ChristopherNeural',
  'en-US-CoraNeural',
  'en-US-DavisNeural',
  'en-US-ElizabethNeural',
  'en-US-GuyNeural',
  'en-US-JacobNeural',
  'en-US-JaneNeural',
  'en-US-JasonNeural',
  'en-US-JennyMultilingualNeural',
  'en-US-JennyNeural',
  'en-US-MichelleNeural',
  'en-US-MonicaNeural',
  'en-US-NancyNeural',
  'en-US-RogerNeural',
  'en-US-SaraNeural',
  'en-US-SteffanNeural',
  'en-US-TonyNeural',
]

let ttsRole = 'en-US-EricNeural'

export const preLoadTTSRole = () => {
  AsyncStorage.getItem(TTS_ROLE_KEY).then(value => {
    if (value !== null) {
      ttsRole = value
    }
  })
}
const getTTSRole = () => {
  if (ttsRole) {
    return ttsRole
  }
}
export const getTTSTemplate = (text: string) => {
  return `
    <speak version='1.0' xml:lang='en-US'>
      <voice name='${getTTSRole()}'>
        ${text}
      </voice>
    </speak>
  `
}

export const saveTTSFile = async (text: string, filePath: string) => {
  return getTTSBlobFile(text).then(res => {
    const base64 = res.base64()
    if (res.info().status === 200 && base64.length > 0) {
      return RNFetchBlob.fs.writeFile(filePath, base64, 'base64')
    } else {
      throw new Error(
        `Failed to get tts blob file, http status:${
          res.info().status
        }\n${res.text()}`,
      )
    }
  })
}

export const hashCode = (text: string) => {
  let hash = 0
  let i
  let chr
  if (text.length === 0) return hash
  for (i = 0; i < text.length; i++) {
    chr = text.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}
