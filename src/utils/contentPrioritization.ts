import { FeedItem } from '../store/feedStore';
import { YouTubeVideo } from '../store/youtubeStore';

/**
 * Content prioritization algorithm for engagement optimization
 * Prioritizes content based on recency, quality, and variety
 */

interface ScoredItem {
  item: FeedItem | YouTubeVideo;
  score: number;
}

export const contentPrioritization = {
  /**
   * Prioritize feed items for maximum engagement
   */
  prioritizeFeedItems: (items: FeedItem[]): FeedItem[] => {
    const scoredItems: ScoredItem[] = items.map((item) => ({
      item,
      score: calculateFeedScore(item),
    }));

    return scoredItems
      .sort((a, b) => b.score - a.score)
      .map((scored) => scored.item as FeedItem);
  },

  /**
   * Prioritize video items for maximum engagement
   */
  prioritizeVideos: (videos: YouTubeVideo[]): YouTubeVideo[] => {
    const scoredItems: ScoredItem[] = videos.map((video) => ({
      item: video,
      score: calculateVideoScore(video),
    }));

    return scoredItems
      .sort((a, b) => b.score - a.score)
      .map((scored) => scored.item as YouTubeVideo);
  },
};

/**
 * Calculate engagement score for feed items
 * Higher scores = more engaging = shown first
 */
function calculateFeedScore(item: FeedItem): number {
  let score = 0;

  // Recency score (0-40 points)
  if (item.publishedAt) {
    const hours = getHoursSincePublish(item.publishedAt);
    if (hours < 4) score += 40;
    else if (hours < 12) score += 35;
    else if (hours < 24) score += 25;
    else if (hours < 72) score += 15;
    else score += 5;
  }

  // Thumbnail quality score (0-30 points)
  if (item.thumbnailUrl) {
    score += 30;
  }

  // Content length score (0-20 points)
  if (item.excerpt) {
    const length = item.excerpt.length;
    if (length >= 100 && length <= 300) score += 20; // Optimal length
    else if (length > 50) score += 15;
    else score += 5;
  }

  // Title quality (0-10 points)
  if (item.title) {
    if (item.title.length > 30 && item.title.length < 100) score += 10;
    else score += 5;
  }

  return score;
}

/**
 * Calculate engagement score for videos
 */
function calculateVideoScore(video: YouTubeVideo): number {
  let score = 0;

  // Recency score (0-40 points)
  const hours = getHoursSincePublish(video.publishedAt);
  if (hours < 6) score += 40;
  else if (hours < 24) score += 30;
  else if (hours < 48) score += 20;
  else score += 10;

  // Thumbnail score (0-30 points)
  if (video.thumbnailUrl) score += 30;

  // Duration score (0-20 points)
  if (video.duration) {
    const match = video.duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (match) {
      const hours = parseInt(match[1] || '0', 10);
      const minutes = parseInt(match[2] || '0', 10);
      const totalMinutes = hours * 60 + minutes;

      // Optimal: 5-20 minutes
      if (totalMinutes >= 5 && totalMinutes <= 20) score += 20;
      else if (totalMinutes < 30) score += 15;
      else score += 10;
    }
  }

  // Title quality (0-10 points)
  if (video.title.length > 20 && video.title.length < 100) score += 10;
  else score += 5;

  return score;
}

/**
 * Get hours since publication
 */
function getHoursSincePublish(publishedAt: string): number {
  const now = new Date();
  const published = new Date(publishedAt);
  return (now.getTime() - published.getTime()) / (1000 * 60 * 60);
}
