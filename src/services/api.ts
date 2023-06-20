import axios from 'axios/index'
import { getMicrosoftApiKey, getOpenAIApiKey } from '../screens/apiKey'
import RNFetchBlob from 'rn-fetch-blob'
import { getTTSTemplate } from '../utils'
import { VOICE_FILE_NAME } from '../utils/constants'
import { ToastAndroid } from 'react-native'

const getMicrosoftTTSAccessToken = async () => {
  const { data } = await axios
    .post(
      'https://eastus.api.cognitive.microsoft.com/sts/v1.0/issuetoken',
      undefined,
      {
        headers: {
          'Ocp-Apim-Subscription-Key': getMicrosoftApiKey(),
        },
      },
    )
    .catch(e => {
      ToastAndroid.show('Microsoft API Key is invalid', 1000)
      throw e
    })
  return data
}

export const getTTSBlobFile = async (text: string) => {
  const token = await getMicrosoftTTSAccessToken()
  return RNFetchBlob.fetch(
    'POST',
    'https://westus.tts.speech.microsoft.com/cognitiveservices/v1',
    {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
    },
    getTTSTemplate(text),
  )
}

export const transformVoiceToText = async (path: string) => {
  const exist = await RNFetchBlob.fs.exists(path)
  if (!exist) {
    throw new Error('Failed to get voice record file:' + path)
  }
  return RNFetchBlob.fetch(
    'POST',
    'https://api.openai.com/v1/audio/transcriptions',
    {
      Authorization: `Bearer ${getOpenAIApiKey()}`,
      'Content-Type': 'multipart/form-data',
    },
    [
      {
        name: 'file',
        filename: VOICE_FILE_NAME,
        data: RNFetchBlob.wrap(path),
      },
      {
        name: 'model',
        data: 'whisper-1',
      },
    ],
  ).then(async res => {
    if (res.info().status === 200) {
      return res.json()
    } else {
      if (res.json().error.code === 'invalid_api_key') {
        ToastAndroid.show('OpenAI API Key is invalid', 1000)
      }
      return Promise.reject(res.json())
    }
  })
}

export type ChatGPTMessages = Array<{
  role: string
  content: string
}>
export const createChatCompletion = (messages: ChatGPTMessages) => {
  return axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getOpenAIApiKey()}`,
      },
    },
  )
}
