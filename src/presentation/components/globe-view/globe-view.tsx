import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import { StyleSheet } from 'react-native'
import WebView from 'react-native-webview'
import { GlobeGlAdapter } from '@/infrastructure/adapters/globe-gl-adapter'
import { IGlobeGlAdapter } from '@/infrastructure/adapters/i-globe-gl-adapter'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const globeHtml = require('./globe.html') as { uri: string } | string

export const GlobeView = forwardRef<IGlobeGlAdapter>((_, ref) => {
  const webViewRef = useRef<WebView>(null)
  const adapter = useRef(new GlobeGlAdapter(webViewRef))

  useImperativeHandle(ref, () => adapter.current)

  return (
    <WebView
      ref={webViewRef}
      source={typeof globeHtml === 'string' ? { uri: globeHtml } : { uri: globeHtml.uri }}
      style={StyleSheet.absoluteFill}
      originWhitelist={['*']}
      allowFileAccess
      javaScriptEnabled
      scrollEnabled={false}
      backgroundColor="transparent"
    />
  )
})

GlobeView.displayName = 'GlobeView'
