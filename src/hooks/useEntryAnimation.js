import { useCallback, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export function useEntryAnimation({ duration = 420, delay = 0, offset = 16, scaleFrom = 0.98 } = {}) {
  const progress = useRef(new Animated.Value(0)).current;

  const animateIn = useCallback(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [delay, duration, progress]);

  useFocusEffect(
    useCallback(() => {
      animateIn();
      return undefined;
    }, [animateIn]),
  );

  const style = {
    opacity: progress,
    transform: [
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [offset, 0],
        }),
      },
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [scaleFrom, 1],
        }),
      },
    ],
  };

  return { style, animateIn };
}
