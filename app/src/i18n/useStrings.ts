import { useAppData } from '@/shared/providers/AppDataProvider';

import { en } from './en';
import { es } from './es';

export function useStrings() {
  const { language } = useAppData();
  return language === 'en' ? en : es;
}
