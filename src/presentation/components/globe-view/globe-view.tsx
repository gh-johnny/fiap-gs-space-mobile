import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import { StyleSheet, Image } from 'react-native'
import WebView from 'react-native-webview'
import { GlobeGlAdapter } from '@/infrastructure/adapters/globe-gl-adapter'
import { IGlobeGlAdapter } from '@/infrastructure/adapters/i-globe-gl-adapter'

// Image.resolveAssetSource converts the Metro asset descriptor into an actual { uri } object
// eslint-disable-next-line @typescript-eslint/no-var-requires
const globeSource = Image.resolveAssetSource(require('./globe.html'))

export const GlobeView = forwardRef<IGlobeGlAdapter>((_, ref) => {
  const webViewRef = useRef<WebView>(null)
  const adapter = useRef(new GlobeGlAdapter(webViewRef))

  useImperativeHandle(ref, () => adapter.current)

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: globeSource.uri }}
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
