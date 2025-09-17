import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface Props {
  title: string;
  variant?: 'default' | 'md' | 'xl' | 'hero' | 'brand';
  compact?: boolean; // reduce el padding superior
  style?: ViewStyle;
  children?: React.ReactNode; // para que cada pantalla coloque subtítulo/contenido introductorio debajo
}

const ScreenHeader: React.FC<Props> = ({ title, variant='default', compact, style, children }) => {
  const isMD = variant === 'md';
  const isXL = variant === 'xl';
  const isHero = variant === 'hero';
  const isBrand = variant === 'brand';
  return (
    <View style={[
      styles.wrapper,
      compact && styles.wrapperCompact,
      isMD && styles.wrapperMD,
      isXL && styles.wrapperXL,
      isHero && styles.wrapperHero,
      isBrand && styles.wrapperBrand,
      style
    ]}>
      <Text
        style={[
          styles.title,
          isMD && styles.titleMD,
          isXL && styles.titleXL,
          isHero && styles.titleHero,
          isBrand && styles.titleBrand
        ]}
        numberOfLines={2}
      >{title}</Text>
      {children ? (
        <View style={[styles.childrenBlock, (isHero || isBrand) && styles.childrenBlockHero]}>{children}</View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF'
  },
  wrapperXL: {
    paddingTop: 16,
    paddingBottom: 16
  },
  wrapperMD: {
    paddingTop: 10,
    paddingBottom: 10
  },
  wrapperHero: {
    backgroundColor:'#3B82F6',
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal:24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor:'#000',
    shadowOpacity:0.12,
    shadowRadius:10,
    shadowOffset:{ width:0, height:4 },
    elevation:6
  },
  wrapperBrand: {
    backgroundColor:'#3B82F6',
    paddingTop: 28,
    paddingBottom: 16,
    paddingHorizontal:24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor:'#000',
    shadowOpacity:0.10,
    shadowRadius:8,
    shadowOffset:{ width:0, height:4 },
    elevation:5
  },
  wrapperCompact: {
    paddingTop: 4,
    paddingBottom: 4
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A'
  },
  titleMD: {
    fontSize: 26,
    lineHeight: 32
  },
  titleXL: {
    fontSize: 32,
    lineHeight: 38
  },
  titleHero: {
    fontSize: 40,
    lineHeight: 46,
    color:'#FFFFFF',
    letterSpacing:0.5,
    textAlign:'center'
  },
  titleBrand: {
    fontSize: 30,
    lineHeight: 36,
    color:'#FFFFFF',
    letterSpacing:0.5,
    textAlign:'center'
  },
  childrenBlock: {
    marginTop: 4
  },
  childrenBlockHero: {
    marginTop: 10,
    alignItems:'center'
  }
});

export default ScreenHeader;
