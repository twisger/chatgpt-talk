import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  ToastAndroid,
} from 'react-native'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import styled from 'styled-components/native'
import { HoldButton } from '../components/holdButton'
import { hashCode, preLoadTTSRole, saveTTSFile } from '../utils'
import {
  ChatGPTMessages,
  createChatCompletion,
  transformVoiceToText,
} from '../services/api'
import {
  addPlayerListener,
  removePlayerListener,
  startPlayer,
  startRecorder,
  stopPlayer,
  stopRecorder,
} from '../services/audio'
import RNFetchBlob from 'rn-fetch-blob'
import Icon from 'react-native-vector-icons/FontAwesome'
import {
  TRANSLATOR_SYSTEM_MESSAGE,
  VOICE_RECORD_PATH,
} from '../utils/constants'
import { PlayBackType } from 'react-native-audio-recorder-player/index'
import { preLoadAPIKey } from './apiKey'
import { PlaceHolder } from '../components/placeholder'
import { useFocusEffect } from '@react-navigation/native'
import { Mode, ModeContext } from '../utils/context'
import Clipboard from '@react-native-clipboard/clipboard'

const getChatGPTResponse = async (messages: ChatGPTMessages) => {
  console.log(messages)
  const { data } = await createChatCompletion(messages)
  console.log(data.choices[0].message)
  return data.choices[0].message.content
}

enum LoadingStatus {
  Ready,
  VoiceRecording,
  VoiceToTextTransforming,
  ChatGPTRequesting,
  TextToSpeechTransforming,
}

const getIndicatorText = (status: LoadingStatus) => {
  return [
    'Ready',
    'Recording your voice',
    'Transforming voice to text',
    'Requesting ChatGPT API',
    'Transforming chatGPT text to voice',
  ][status]
}
const messageAudioPathCache = new Map()
export const Chat = () => {
  const [messages, setMessages] = useState<ChatGPTMessages>([])
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.Ready)
  const [textPlaying, setTextPlaying] = useState('')
  const mode = useContext(ModeContext)
  useEffect(() => {
    if (mode === Mode.Translator) {
      setMessages([TRANSLATOR_SYSTEM_MESSAGE])
      ToastAndroid.show('Enter translator mode', 500)
    } else {
      setMessages([])
    }
  }, [mode])
  const handleRecord = async () => {
    const path = Platform.select({
      android: RNFetchBlob.fs.dirs.CacheDir + `/record${Date.now()}.mp3`,
      ios: undefined,
    })
    await startRecorder(path || VOICE_RECORD_PATH)
    setLoadingStatus(LoadingStatus.VoiceRecording)
  }
  const errorHandler = (text: string) => (e: Error) => {
    setLoadingStatus(LoadingStatus.Ready)
    console.error(`${text}`)
    throw e
  }
  const handleStop = async () => {
    const recordAudioPath = await stopRecorder()
    setLoadingStatus(LoadingStatus.VoiceToTextTransforming)

    const { text } = await transformVoiceToText(recordAudioPath).catch(
      errorHandler('Failed to transform voice to text:'),
    )

    messageAudioPathCache.set(hashCode(text), recordAudioPath)
    await handleUserText(text)
  }
  const handleUserText = async (text: string) => {
    setLoadingStatus(LoadingStatus.ChatGPTRequesting)
    const historyMessages =
      mode === Mode.Translator ? [TRANSLATOR_SYSTEM_MESSAGE] : messages
    const assistantText = await getChatGPTResponse([
      ...historyMessages,
      { role: 'user', content: text },
    ]).catch(errorHandler('Failed to call chatGPT API:'))

    setLoadingStatus(LoadingStatus.TextToSpeechTransforming)

    setMessages([
      ...messages,
      { role: 'user', content: text },
      { role: 'assistant', content: assistantText },
    ])

    const filePath = RNFetchBlob.fs.dirs.CacheDir + `/tts${hashCode(text)}.mp3`

    await saveTTSFile(assistantText, filePath).catch(
      errorHandler('Failed to save TTS file:'),
    )
    messageAudioPathCache.set(hashCode(assistantText), filePath)
    await startPlayer(filePath).catch(errorHandler('Failed to start Player: '))
    setTextPlaying(assistantText)
    setLoadingStatus(LoadingStatus.Ready)
  }

  const handleClear = () => {
    setMessages(messages.filter(item => item.role === 'system'))
    stopPlayer()
    messageAudioPathCache.clear()
  }

  useEffect(() => {
    addPlayerListener((e: PlayBackType) => {
      if (e.currentPosition >= e.duration) {
        setTextPlaying('')
      }
    })
    return removePlayerListener
  }, [])

  useFocusEffect(
    useCallback(() => {
      preLoadAPIKey()
      preLoadTTSRole()
    }, []),
  )
  const handlePressText = async (text: string) => {
    const key = hashCode(text)

    if (messageAudioPathCache.has(key)) {
      await stopPlayer()
      if (text === textPlaying) {
        setTextPlaying('')
        return
      }
      setTextPlaying(text)

      await startPlayer(messageAudioPathCache.get(key)).catch(
        errorHandler('Failed to start Player: '),
      )
    }
  }
  const filteredMessages = messages.filter(item => item.role !== 'system')
  const [inputVisible, setInputVisible] = useState(false)
  const handleLongPress = (text: string) => {
    Clipboard.setString(text)
    ToastAndroid.show('Copy to clipboard!', 500)
  }
  return (
    <Container>
      {loadingStatus !== LoadingStatus.Ready &&
        loadingStatus !== LoadingStatus.VoiceRecording && (
          <IndicatorContainer>
            <ActivityIndicator size="large" color="#00ff00" />
            <IndicatorText>{getIndicatorText(loadingStatus)}</IndicatorText>
          </IndicatorContainer>
        )}
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 80 }}>
        {filteredMessages.length === 0 && (
          <PlaceHolder text="Nice to talk with you!" />
        )}
        {filteredMessages.map((item, index) => {
          const Press = item.role === 'user' ? UserText : AssistantText
          return (
            <Press
              key={index}
              onPress={() => handlePressText(item.content)}
              onLongPress={() => handleLongPress(item.content)}>
              <Text
                style={{
                  color: textPlaying === item.content ? '#5f9ea0' : undefined,
                }}>
                {item.content}
              </Text>
            </Press>
          )
        })}
      </ScrollView>
      <PlusButton onPress={() => setInputVisible(true)}>
        <Icon name="plus-circle" size={32} />
      </PlusButton>
      {inputVisible && (
        <StyledInput
          autoFocus={true}
          onBlur={() => setInputVisible(false)}
          onSubmitEditing={e => handleUserText(e.nativeEvent.text)}
        />
      )}
      <HoldButton onPressIn={handleRecord} onPressOut={handleStop} />
      <ClearButton onPress={handleClear}>
        <Icon name="trash-o" size={32} />
      </ClearButton>
    </Container>
  )
}

const StyledInput = styled.TextInput`
  background-color: #eee;
  width: 70%;
  padding: 0;
  position: absolute;
  bottom: 12px;
  z-index: 1;
  border: 1px solid #ddd;
`

const IndicatorText = styled.Text`
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 20px;
`

const PlusButton = styled.Pressable`
  align-items: center;
  text-align: center;
  position: absolute;
  bottom: 10px;
  right: 20px;
  z-index: 1;
`

const ClearButton = styled.Pressable`
  align-items: center;
  text-align: center;
  position: absolute;
  bottom: 10px;
  left: 20px;
  z-index: 1;
`

const IndicatorContainer = styled.View`
  background-color: rgba(0, 0, 0, 0.3);
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 9;
`

const Container = styled.View`
  flex: 1;
  flex-direction: column;
  align-items: center;
`

const AssistantText = styled.Pressable`
  padding: 12px;
  border-radius: 8px;
  background-color: #fff;
  margin-top: 12px;
`
const UserText = styled.Pressable`
  padding: 12px;
  border-radius: 8px;
  background-color: rgb(149, 236, 105);
  margin-top: 12px;
`
