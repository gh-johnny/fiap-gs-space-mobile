import React, { createContext, useContext } from 'react'
import { container, type Container } from './container'

const ContainerContext = createContext<Container>(container)

export function ContainerProvider({ children }: { children: React.ReactNode }) {
  return <ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>
}

export function useContainer(): Container {
  return useContext(ContainerContext)
}
