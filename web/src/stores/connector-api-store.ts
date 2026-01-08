// import { io } from 'socket.io-client'
import { defineStore } from 'pinia'

interface PiniaState {
  sessionId: string | null
}

// sessionId
export const useConnectorAPIStore = defineStore('connectorAPI', {
  state: (): PiniaState => ({
    sessionId: null
  }),
  getters: {
  },
  actions: {
  }

})
