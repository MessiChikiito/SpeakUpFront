import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { reportService } from '../services/reportServices';

interface InlineVoteBarProps {
  id: number | string;
  score?: number;
  upCount?: number;
  downCount?: number;
  userVote?: number; // -1 0 1
  onChange?: (data:any)=>void;
  large?: boolean;
}

const computeDelta = (from:number,to:number) => {
  if (from===to) return 0;
  if (from===0 && to===1) return +1;
  if (from===0 && to===-1) return -1;
  if (from===1 && to===0) return -1;
  if (from===-1 && to===0) return +1;
  if (from===1 && to===-1) return -2;
  if (from===-1 && to===1) return +2;
  return 0;
};

export const InlineVoteBar: React.FC<InlineVoteBarProps> = ({ id, score=0, upCount=0, downCount=0, userVote=0, onChange, large }) => {
  const [localScore, setLocalScore] = useState(score);
  const [localUp, setLocalUp] = useState(upCount);
  const [localDown, setLocalDown] = useState(downCount);
  const [localVote, setLocalVote] = useState(userVote);
  const [loading, setLoading] = useState(false);

  const act = useCallback(async (target:number) => {
    if (loading) return;
    setLoading(true);
    const prevVote = localVote;
    const deltaScore = computeDelta(prevVote, target);
    // Apply optimistic changes to score & counts
    let up = localUp;
    let down = localDown;
    if (prevVote !== target) {
      if (prevVote === 1) up -= 1;
      if (prevVote === -1) down -= 1;
      if (target === 1) up += 1;
      if (target === -1) down += 1;
    }
    setLocalVote(target);
    setLocalScore(s => s + deltaScore);
    setLocalUp(up); setLocalDown(down);
    try {
      const updated = await reportService.vote(id, target);
      setLocalScore(updated.score ?? (updated.upCount - updated.downCount));
      setLocalUp(updated.upCount ?? up);
      setLocalDown(updated.downCount ?? down);
      setLocalVote(updated.userVote ?? target);
      onChange && onChange(updated);
    } catch (e) {
      // rollback
      setLocalVote(prevVote);
      setLocalScore(s => s - deltaScore);
      setLocalUp(localUp); setLocalDown(localDown);
    } finally { setLoading(false); }
  }, [id, localVote, localUp, localDown, onChange, loading]);

  const sizeStyle = large ? styles.smallVariant : {};
  const upActive = localVote === 1;
  const downActive = localVote === -1;

  return (
    <View style={[styles.container, sizeStyle]}>
      <TouchableOpacity style={[styles.arrowBtn, upActive && styles.arrowBtnActiveUp]} disabled={loading} onPress={()=>act(upActive?0:1)}>
        <Text style={[styles.arrow, upActive && styles.arrowActive]}>▲</Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="small" color="#2563EB" style={{ marginHorizontal:8 }} />
      ) : (
        <Text style={[styles.scoreText, localScore>0?styles.scorePositive:localScore<0?styles.scoreNegative:null]}>{localScore}</Text>
      )}
      <TouchableOpacity style={[styles.arrowBtn, downActive && styles.arrowBtnActiveDown]} disabled={loading} onPress={()=>act(downActive?0:-1)}>
        <Text style={[styles.arrow, downActive && styles.arrowActive]}>▼</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection:'row', alignItems:'center' },
  smallVariant: { },
  arrowBtn: { padding:2, borderRadius:6 },
  arrowBtnActiveUp: { backgroundColor:'#DBEAFE' },
  arrowBtnActiveDown: { backgroundColor:'#FEE2E2' },
  arrow: { fontSize:14, color:'#64748B', fontWeight:'600' },
  arrowActive: { color:'#111827' },
  centerBlock: { },
  scoreText: { fontSize:14, fontWeight:'700', color:'#111827', marginHorizontal:6 },
  scorePositive: { color:'#16A34A' },
  scoreNegative: { color:'#DC2626' },
  subCounts: { },
});

export default InlineVoteBar;
