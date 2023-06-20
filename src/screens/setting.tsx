import React, { useEffect, useState } from 'react'
import { Text, ToastAndroid } from 'react-native'
import styled from 'styled-components/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  MICROSOFT_APIKEY_KEY,
  OPENAI_APIKEY_KEY,
  TTS_ROLE_KEY,
} from '../utils/constants'
import { Picker } from '@react-native-picker/picker'
import { MICROSOFT_TTS_ROLES } from '../utils'

interface Props {
  label: string
  placeholder: string
  handleSubmit: (text: string) => void
}
const APIKeyInput = ({ label, placeholder, handleSubmit }: Props) => {
  const [text, setText] = useState('')
  return (
    <Row>
      <Label>{label}: </Label>
      <StyledTextInput
        value={text}
        onChangeText={setText}
        onSubmitEditing={() => handleSubmit(text)}
        placeholder={placeholder}
      />
    </Row>
  )
}

export const SettingScreen = () => {
  const [openAIPlaceholder, setOpenAIPlaceholder] = useState(
    'Enter OpenAI API key',
  )
  const [msPlaceholder, setMsPlaceholder] = useState(
    'Enter Microsoft TTS API key',
  )
  const [role, setRole] = useState<string>()

  useEffect(() => {
    AsyncStorage.getItem(TTS_ROLE_KEY).then(value => {
      if (value !== null) {
        setRole(value)
      }
    })
    AsyncStorage.getItem(OPENAI_APIKEY_KEY).then(value => {
      if (value !== null) {
        setOpenAIPlaceholder('**********')
      }
    })
    AsyncStorage.getItem(MICROSOFT_APIKEY_KEY).then(value => {
      if (value !== null) {
        setMsPlaceholder('**********')
      }
    })
  })
  const handleOpenAISubmit = async (openAIApiKey: string) => {
    if (openAIApiKey.length === 0) {
      return
    }
    if (openAIApiKey.length !== 51) {
      ToastAndroid.show(
        'OpenAI API key length should be 51, check if your API key is correct!',
        1000,
      )
    }
    await AsyncStorage.setItem(OPENAI_APIKEY_KEY, openAIApiKey)
    ToastAndroid.show('OpenAI API key configured', 1000)
  }

  const handleMicrosoftSubmit = async (msTTSAPIKey: string) => {
    if (msTTSAPIKey.length === 0) {
      return
    }
    if (msTTSAPIKey.length !== 32) {
      ToastAndroid.show(
        'Microsoft API key length should be 32, check if your API key is correct!',
        1000,
      )
    }
    await AsyncStorage.setItem(MICROSOFT_APIKEY_KEY, msTTSAPIKey)
    ToastAndroid.show('Microsoft API key configured', 1000)
  }

  const handleRoleChange = (role: string) => {
    setRole(role)
    AsyncStorage.setItem(TTS_ROLE_KEY, role)
    ToastAndroid.show('Microsoft Role configured', 500)
  }
  return (
    <Container>
      <APIKeyInput
        label="OpenAI"
        handleSubmit={handleOpenAISubmit}
        placeholder={openAIPlaceholder}
      />
      <APIKeyInput
        label="Microsoft"
        handleSubmit={handleMicrosoftSubmit}
        placeholder={msPlaceholder}
      />
      <Text style={{ marginTop: 24, color: '#333' }}>TTS Role: </Text>
      <Picker
        prompt="Select TTS role"
        selectedValue={role}
        onValueChange={handleRoleChange}>
        {MICROSOFT_TTS_ROLES.map(item => (
          <Picker.Item key={item} label={item} value={item} />
        ))}
      </Picker>
    </Container>
  )
}
const Label = styled.Text`
  color: #333;
  line-height: 50px;
  flex: 1;
`

const Container = styled.View`
  padding: 20px;
  justify-items: center;
`

const Row = styled.View`
  flex-direction: row;
  margin-top: 10px;
`

const StyledTextInput = styled.TextInput`
  border-bottom-width: 1px;
  border-color: #ddd;
  flex: 2;
  height: 50px;
`
