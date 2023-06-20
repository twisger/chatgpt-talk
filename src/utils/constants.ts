import RNFetchBlob from 'rn-fetch-blob'

export const TTS_FILE_PATH = RNFetchBlob.fs.dirs.CacheDir + '/tts.mp3'

export const VOICE_FILE_NAME = 'record.mp3'
export const VOICE_RECORD_PATH =
  RNFetchBlob.fs.dirs.CacheDir + '/' + VOICE_FILE_NAME

export const OPENAI_APIKEY_KEY = '@OpenAI_APIKey'

export const MICROSOFT_APIKEY_KEY = '@Microsoft_APIKey'

export const TTS_ROLE_KEY = '@TTS_Role'

export const TRANSLATOR_SYSTEM_MESSAGE = {
  role: 'system',
  content:
    'You are a translator, translate all chinese to english, all english to chinese. Do not include any answer or interpretation in response, only translate',
}
