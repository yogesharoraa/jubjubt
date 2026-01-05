// hooks/useRecommender.ts
"use client";
import { useState, useCallback } from 'react';
import Cookies from 'js-cookie';
import { RECOMMENDER_API } from '../utils/config';

export const useRecommender = () => {
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Engagement score calculation function add karein
  const calculateEngagementScore = useCallback((reel: any, currentUserId?: string) => {
    const likes = Number(reel.total_likes) || 0;
    const views = Number(reel.total_views) || 1;
    const comments = Number(reel.total_comments) || 0;
    const shares = Number(reel.total_shares) || 0;
    const saves = Number(reel.total_saves) || 0;
    
    const isOwnReel = currentUserId && reel.user_id === Number(currentUserId);
    const ownReelPenalty = isOwnReel ? -500 : 0;
    
    // Calculate engagement ratios
    const likeRatio = views > 0 ? (likes / views) * 100 : 0;
    const commentRatio = views > 0 ? (comments / views) * 75 : 0;
    const shareRatio = views > 0 ? (shares / views) * 50 : 0;
    const saveRatio = views > 0 ? (saves / views) * 40 : 0;
    
    // Normalize with logarithmic scaling
    const normalizedLikes = Math.log(likes + 1) * 15;
    const normalizedViews = Math.log(views + 1) * 8;
    const normalizedComments = Math.log(comments + 1) * 20;
    const normalizedShares = Math.log(shares + 1) * 25;
    const normalizedSaves = Math.log(saves + 1) * 30;
    
    // Weighted total score
    const totalScore = 
      likeRatio * 0.3 +
      commentRatio * 0.25 +
      shareRatio * 0.2 +
      saveRatio * 0.15 +
      normalizedLikes * 0.4 +
      normalizedViews * 0.1 +
      normalizedComments * 0.3 +
      normalizedShares * 0.35 +
      normalizedSaves * 0.25 +
      ownReelPenalty;
    
    return Math.max(0, Math.min(1000, totalScore));
  }, []);

  // ✅ Track events
  const trackEvent = useCallback(async (
    item_id: string, 
    event_type: 'like' | 'view' | 'share' | 'comment' | 'engagement', 
    likes_count?: number, 
    views_count?: number,
    reel_data?: any
  ) => {
    const user_id = Cookies.get('Reelboost_user_id');
    
    if (!user_id) {
      console.log("🔒 User not logged in, skipping event tracking");
      return;
    }

    try {
      const eventPayload = {
        user_id: user_id,
        item_id: item_id,
        event_type: event_type,
        timestamp: new Date().toISOString()
      };

      console.log(`📤 Sending ${event_type} event:`, eventPayload);

      const response = await fetch(`${RECOMMENDER_API}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ ${event_type.toUpperCase()} event tracked successfully`);
        return true;
      } else {
        console.error(`❌ Failed to track ${event_type} event`);
        return false;
      }
    } catch (error) {
      console.error('💥 Error tracking event:', error);
      return false;
    }
  }, []);

  // ✅ Get recommendations
  const getRecommendations = useCallback(async (k: number = 10): Promise<string[]> => {
    const user_id = Cookies.get('Reelboost_user_id');
    
    if (!user_id) {
      console.log("🔒 User not logged in, no recommendations");
      return [];
    }

    setIsLoading(true);
    
    try {
      console.log(`🚀 Fetching ${k} recommendations for user: ${user_id}`);

      const response = await fetch(
        `${RECOMMENDER_API}/recommendations/${user_id}?k=${k}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("🎯 Recommendations received:", {
          count: data.recommendations?.length || 0,
          recommendations: data.recommendations,
          interaction_count: data.interaction_count
        });
        return data.recommendations || [];
      } else {
        console.error('❌ Failed to fetch recommendations');
        return [];
      }
    } catch (error) {
      console.error('💥 Error fetching recommendations:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Engagement tracking
  const trackEngagement = useCallback(async (reel: any) => {
    try {
      const engagementScore = calculateEngagementScore(reel);
      console.log("📈 Engagement Score:", engagementScore.toFixed(2));
      
      // Track engagement event
      await trackEvent(
        reel.social_id.toString(),
        'engagement',
        reel.total_likes,
        reel.total_views,
        reel
      );
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  }, [trackEvent, calculateEngagementScore]);

  // ✅ Get system status
  const getSystemStatus = useCallback(async () => {
    try {
      const response = await fetch(`${RECOMMENDER_API}/status`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error getting system status:', error);
      return null;
    }
  }, []);

  return {
    trackEvent,
    trackEngagement,
    getRecommendations,
    getSystemStatus,
    calculateEngagementScore, // ✅ Yeh add karna important hai
    isLoading
  };
};