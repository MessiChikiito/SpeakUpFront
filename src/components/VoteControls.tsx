import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { reportService } from '../services/reportServices';

interface VoteControlsProps {
  id: number | string;
  score: number | undefined;
  userVote: number | undefined; // -1 | 0 | 1
  size?: 'sm' | 'md';
  onChange?: (data: any) => void; // updated denuncia
}

export const VoteControls: React.FC<VoteControlsProps> = ({ id, score = 0, userVote = 0, size='md', onChange }) => {
  const [currentVote, setCurrentVote] = useState(userVote);
  const [currentScore, setCurrentScore] = useState(score);
  const [loading, setLoading] = useState(false);

  const applyLocalDelta = useCallback((from: number, to: number) => {
    if (from === to) return 0; // no change
    if (from === 0 && to === 1) return +1;
    if (from === 0 && to === -1) return -1;
    if (from === 1 && to === 0) return -1;
    if (from === -1 && to === 0) return +1;
    if (from === 1 && to === -1) return -2;
    if (from === -1 && to === 1) return +2;
    return 0;
  }, []);

  const sendVote = async (value: number) => {
    if (loading) return;
    setLoading(true);
    const prevVote = currentVote;
    const delta = applyLocalDelta(prevVote, value);
    // Optimistic update
    setCurrentVote(value);
    setCurrentScore(s => s + delta);
    try {
      const updated = await reportService.vote(id, value);
      setCurrentScore(updated.score ?? (updated.upCount - updated.downCount));
      setCurrentVote(updated.userVote ?? value);
      onChange && onChange(updated);
    } catch (e) {
      // rollback
      setCurrentVote(prevVote);
      setCurrentScore(s => s - delta);
    } finally {
      setLoading(false);
    }
  };

  const handleUp = () => {
    const next = currentVote === 1 ? 0 : 1; // toggle
    sendVote(next);
  };
  const handleDown = () => {
    const next = currentVote === -1 ? 0 : -1; // toggle
    sendVote(next);
  };

  const upActive = currentVote === 1;
  const downActive = currentVote === -1;

  return (
    <View style={[styles.container, size === 'sm' && styles.containerSm]}>
      <TouchableOpacity style={[styles.button, upActive && styles.activeUp]} onPress={handleUp} disabled={loading}>
        <Text style={[styles.arrow, upActive && styles.arrowActive]}>▲</Text>
      </TouchableOpacity>
      <View style={styles.scoreWrapper}>
        {loading ? <ActivityIndicator size="small" color="#3B82F6" /> : (
          <Text style={styles.score}>{currentScore}</Text>
        )}
      </View>
      <TouchableOpacity style={[styles.button, downActive && styles.activeDown]} onPress={handleDown} disabled={loading}>
        <Text style={[styles.arrow, downActive && styles.arrowActive]}>▼</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerSm: { width: 36 },
  button: {
    padding: 4,
    borderRadius: 6,
  },
  activeUp: { backgroundColor: '#DBEAFE' },
  activeDown: { backgroundColor: '#FEE2E2' },
  arrow: { fontSize: 16, color: '#6B7280' },
  arrowActive: { color: '#1F2937', fontWeight: '700' },
  scoreWrapper: { paddingVertical: 2 },
  score: { fontSize: 14, fontWeight: '600', color: '#111827' },
});

export default VoteControls;
