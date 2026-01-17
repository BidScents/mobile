import { supabase } from '@/lib/supabase';
import { isUpdateNeeded } from '@/utils/version-check';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface VersionConfig {
  min_version: string;
  store_url: string;
  latest_version?: string;
  force_update?: boolean;
}

export const useCheckForUpdate = () => {
  const [isUpdateRequired, setIsUpdateRequired] = useState(false);
  const [storeUrl, setStoreUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const currentVersion = Constants.expoConfig?.version || '1.0.0';
        const platform = Platform.OS === 'ios' ? 'ios' : 'android';

        // Fetch version config from Supabase
        // Assuming table 'app_versions' exists with columns: platform, min_version, store_url
        const { data, error } = await supabase
          .from('app_versions')
          .select('min_version, store_url')
          .eq('platform', platform)
          .single();

        if (error) {
          console.warn('Failed to fetch app version config:', error.message);
          // Don't block the app if the check fails (e.g. offline)
          setLoading(false);
          return;
        }

        if (data) {
          const config = data as VersionConfig;
          const updateNeeded = isUpdateNeeded(currentVersion, config.min_version);
          
          if (updateNeeded) {
            setIsUpdateRequired(true);
            setStoreUrl(config.store_url);
          }
        }
      } catch (err) {
        console.warn('Error checking for updates:', err);
      } finally {
        setLoading(false);
      }
    };

    checkVersion();
  }, []);

  return { isUpdateRequired, storeUrl, loading };
};
