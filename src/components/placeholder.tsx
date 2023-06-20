import Icon from 'react-native-vector-icons/FontAwesome'
import React from 'react'
import styled from 'styled-components/native'

export const PlaceHolder = ({ text }: { text: string }) => {
  return (
    <PlaceholderView>
      <Icon name="smile-o" size={120} color="#333" />
      <PlaceholderText>{text}</PlaceholderText>
    </PlaceholderView>
  )
}

const PlaceholderView = styled.View`
  flex: 1;
  align-items: center;
  padding-top: 50%;
`

const PlaceholderText = styled.Text`
  font-size: 24px;
  text-align: center;
  padding: 20px;
  border-radius: 8px;
`
