import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { ConjunctionEvent } from '@/domain/entities'
import type { Severity } from '@/domain/value-objects'

interface ConjunctionItemProps {
  event: ConjunctionEvent
}

const SEVERITY_COLORS: Record<Severity, string> = {
  CRITICAL: '#FF3B30',
  WARNING: '#FF9500',
  INFO: '#34C759',
}

export function ConjunctionItem({ event }: ConjunctionItemProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.bar, { backgroundColor: SEVERITY_COLORS[event.severity] }]} />
      <View style={styles.info}>
        <Text style={styles.names}>
          {event.objectA.name} — {event.objectB.name}
        </Text>
        <View style={styles.row}>
          <Text style={styles.detail}>Pc {event.pc.toScientificNotation()}</Text>
          <Text style={styles.detail}>{event.missDistance.toDisplayString()}</Text>
          <Text style={styles.detail}>{event.tcpa.toDisplayString()}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  bar: { width: 3 },
  info: { flex: 1, padding: 12, gap: 4 },
  names: { color: '#fff', fontSize: 13, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12 },
  detail: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
})
