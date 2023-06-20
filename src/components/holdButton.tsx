import React from 'react'
import styled from 'styled-components/native'
import { PressableProps } from 'react-native'

export const HoldButton = (props: PressableProps) => {
  return (
    <HoldButtonWrapper
      {...props}
      android_ripple={{ color: 'chartreuse', borderless: true }}>
      <HoldButtonText>Hold to talk</HoldButtonText>
    </HoldButtonWrapper>
  )
}

const HoldButtonWrapper = styled.Pressable`
  position: absolute;
  bottom: 0;
  width: 100%;
`

const HoldButtonText = styled.Text`
  background-color: #fff;
  padding: 20px;
  text-align: center;
`
