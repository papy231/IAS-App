import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

import tapSoundFile from '../assets/sounds/tap.wav';
import trashSoundFile from '../assets/sounds/trash.wav';

let tapSound;
let trashSound;

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

async function ensureTrashSound() {
  if (trashSound) {
    return trashSound;
  }
  const { sound } = await Audio.Sound.createAsync(
    trashSoundFile,
    { volume: 0.35, shouldPlay: false },
  );
  trashSound = sound;
  return trashSound;
}

export async function playTrashFeedback() {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }
  try {
    const sound = await ensureTrashSound();
    if (sound) {
      await sound.replayAsync();
      return;
    }
  } catch (error) {
    // Ignore playback errors to avoid blocking UI actions.
  }
  await playTapFeedback();
}
