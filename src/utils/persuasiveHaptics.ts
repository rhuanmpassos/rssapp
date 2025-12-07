import * as Haptics from 'expo-haptics';

/**
 * Persuasive haptic feedback patterns
 * Strategic vibrations to increase engagement and satisfaction
 */

export const persuasiveHaptics = {
  /**
   * Light satisfying tap on card interactions
   */
  cardTap: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /**
   * Double-tap pattern for refresh - creates satisfying feedback loop
   */
  refreshRelease: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Second tap after slight delay for satisfaction
    setTimeout(async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 80);
  },

  /**
   * Success notification for content loaded
   */
  contentLoaded: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /**
   * Subtle milestone vibration - every 10 items scrolled
   */
  scrollMilestone: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /**
   * Rewarding haptic on action completion
   */
  actionComplete: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /**
   * Subtle nudge for new content reveal
   */
  contentReveal: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /**
   * Strategic delay to increase anticipation before action
   * Returns a promise that resolves after delay
   */
  anticipationDelay: (ms: number = 100): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};
