import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

import tapSoundFile from '../assets/sounds/tap.wav';

let tapSound;

async function ensureTapSound() {
  if (tapSound) {
    return tapSound;
  }
  const { sound } = await Audio.Sound.createAsync(
    tapSoundFile,
    { volume: 0.25, shouldPlay: false },
  );
  tapSound = sound;
  return tapSound;
}

export async function playTapFeedback() {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }
  try {
    const sound = await ensureTapSound();
    await sound.replayAsync();
  } catch (error) {
    // Ignore playback errors to avoid blocking UI actions.
  }
}
