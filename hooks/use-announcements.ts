import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { Announcement } from '@/types/announcements';

const STORAGE_KEY_PREFIX = 'announcement_seen_';

export function useAnnouncements() {
  const [queue, setQueue] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Derived state
  const visible = queue.length > 0;
  const announcement = queue[0] || null;
  const hasMore = queue.length > 1;

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const now = new Date().toISOString();

      // Fetch active announcements (limit 10 to be safe)
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.log('Error fetching announcements:', error);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        // Filter out announcements that have already been seen (if show_once is true)
        const validAnnouncements = await Promise.all(
          (data as Announcement[]).map(async (item) => {
            if (item.show_once) {
              const seen = await AsyncStorage.getItem(`${STORAGE_KEY_PREFIX}${item.id}`);
              return seen ? null : item;
            }
            return item;
          })
        );

        // Filter out nulls and set the queue
        setQueue(validAnnouncements.filter((item): item is Announcement => item !== null));
      }
    } catch (error) {
      console.log('Error in useAnnouncements:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAnnouncement = async () => {
    if (!announcement) return;

    // Mark as seen if it's a show_once announcement
    if (announcement.show_once) {
      try {
        await AsyncStorage.setItem(`${STORAGE_KEY_PREFIX}${announcement.id}`, 'true');
      } catch (error) {
        console.log('Error saving announcement state:', error);
      }
    }

    // Remove the current announcement from the queue
    setQueue((prev) => prev.slice(1));
  };

  return {
    announcement,
    visible,
    loading,
    dismissAnnouncement,
    hasMore,
  };
}