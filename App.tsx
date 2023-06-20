import React, { useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Chat } from './src/screens/chat'
import Icon from 'react-native-vector-icons/AntDesign'
import { Pressable, Switch } from 'react-native'
import { SettingScreen } from './src/screens/setting'
import { Mode, ModeContext } from './src/utils/context'

const Stack = createNativeStackNavigator()

function App(): JSX.Element {
  const [isTranslator, setIsTranslator] = useState(false)
  return (
    <ModeContext.Provider value={isTranslator ? Mode.Translator : Mode.Chat}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen
            name="chat"
            component={Chat}
            options={({ navigation }) => ({
              title: 'Talk with ChatGPT!',
              headerRight: () => (
                <>
                  <Switch
                    value={isTranslator}
                    onValueChange={setIsTranslator}
                  />
                  <Pressable onPress={() => navigation.navigate('Settings')}>
                    <Icon name="setting" size={24} />
                  </Pressable>
                </>
              ),
            })}
          />
          <Stack.Screen
            name="Settings"
            component={SettingScreen}
            options={{ title: 'Settings' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ModeContext.Provider>
  )
}
export default App
