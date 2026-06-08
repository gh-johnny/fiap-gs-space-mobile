import React, { useRef, forwardRef, useImperativeHandle } from 'react'
import { StyleSheet, Image } from 'react-native'
import WebView, { WebViewMessageEvent } from 'react-native-webview'
import { GlobeGlAdapter } from '@/infrastructure/adapters/globe-gl-adapter'
import { IGlobeGlAdapter } from '@/infrastructure/adapters/i-globe-gl-adapter'

// Image.resolveAssetSource converts the Metro asset descriptor into an actual { uri } object
// eslint-disable-next-line @typescript-eslint/no-var-requires
const globeSource = Image.resolveAssetSource(require('./globe.html'))

interface GlobeViewProps {
  onSatelliteTap?: (noradId: string) => void
  onSatCardClose?: () => void
  onSatCardOpenSheet?: () => void
  onReady?: () => void
}

export const GlobeView = forwardRef<IGlobeGlAdapter, GlobeViewProps>(({ onSatelliteTap, onSatCardClose, onSatCardOpenSheet, onReady }, ref) => {
  const webViewRef = useRef<WebView>(null)
  const adapter = useRef(new GlobeGlAdapter(webViewRef))
  const onSatelliteTapRef    = useRef(onSatelliteTap)
  const onSatCardCloseRef    = useRef(onSatCardClose)
  const onSatCardOpenSheetRef = useRef(onSatCardOpenSheet)
  onSatelliteTapRef.current    = onSatelliteTap
  onSatCardCloseRef.current    = onSatCardClose
  onSatCardOpenSheetRef.current = onSatCardOpenSheet

  useImperativeHandle(ref, () => adapter.current)

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const msg = JSON.parse(event.nativeEvent.data)
      if (msg.type === 'SATELLITE_TAPPED') {
        onSatelliteTapRef.current?.(msg.payload.noradId)
      } else if (msg.type === 'SAT_CARD_CLOSE') {
        onSatCardCloseRef.current?.()
      } else if (msg.type === 'SAT_CARD_OPEN_SHEET') {
        onSatCardOpenSheetRef.current?.()
      }
    } catch (_) {}
  }

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
      onMessage={handleMessage}
      onLoad={onReady}
    />
  )
})

GlobeView.displayName = 'GlobeView'
