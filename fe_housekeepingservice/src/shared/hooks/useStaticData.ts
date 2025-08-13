import { useState, useEffect } from 'react';

type Language = 'vi' | 'en';

interface StaticData {
  [key: string]: any;
}

export const useStaticData = (pageName: string, language: Language = 'vi') => {
  const [data, setData] = useState<StaticData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await import(`../../static-data/pages/${pageName}.json`);
        setData(response.default[language] || response.default.vi);
        setError(null);
      } catch (err) {
        console.error(`Failed to load static data for ${pageName}:`, err);
        setError(`Failed to load page data: ${pageName}`);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [pageName, language]);

  return { data, loading, error };
};

// Helper function để get nested properties
export const getNestedValue = (obj: any, path: string, defaultValue: string = '') => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : defaultValue;
  }, obj);
};
