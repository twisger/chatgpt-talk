import { createContext } from 'react'

export enum Mode {
  Chat = 'chat',
  Translator = 'translator',
}
export const ModeContext = createContext(Mode.Chat)
