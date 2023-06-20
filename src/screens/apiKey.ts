import AsyncStorage from '@react-native-async-storage/async-storage'
import { MICROSOFT_APIKEY_KEY, OPENAI_APIKEY_KEY } from '../utils/constants'

let openAIAPIKey = ''
let microsoftAPIKey = ''

export const preLoadAPIKey = () => {
  AsyncStorage.getItem(OPENAI_APIKEY_KEY).then(value => {
    if (value !== null) {
      openAIAPIKey = value
    }
  })
  AsyncStorage.getItem(MICROSOFT_APIKEY_KEY).then(value => {
    if (value !== null) {
      microsoftAPIKey = value
    }
  })
}
export const getOpenAIApiKey = () => {
  if (openAIAPIKey) {
    return openAIAPIKey
  } else {
    throw new Error('Failed to get Open AI APIkey')
  }
}

export const getMicrosoftApiKey = () => {
  if (microsoftAPIKey) {
    return microsoftAPIKey
  } else {
    throw new Error('Failed to get Microsoft APIkey')
  }
}
