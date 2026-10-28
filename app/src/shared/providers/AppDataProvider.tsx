import Constants from 'expo-constants';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { AppRepository } from '@/features/purchases/repository';
import { createAppRepository } from '@/features/purchases/repositoryFactory';
import type {
  Purchase,
  PurchaseInput,
  PurchaseItemInput,
} from '@/features/purchases/types';
import type { DataMode } from '@/shared/runtime/environment';
import { todayIsoDate } from '@/shared/utils/date';
import { palettes, ACCENTS, themeColors, type Accent, type ThemeMode } from '@/theme/theme';

import { es } from '@/i18n/es';
import { en } from '@/i18n/en';
import type { Language } from '@/i18n/language';

interface AppDataValue {
  mode: DataMode | null;
  loading: boolean;
  error: string | null;
  purchases: Purchase[];
  appVersion: string;
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  theme: ThemeMode;
  accent: Accent;
  colors: (typeof palettes)[ThemeMode];
  setTheme: (mode: ThemeMode) => Promise<void>;
  setAccent: (accent: Accent) => Promise<void>;
  retry: () => Promise<void>;
  createPurchase: (input: PurchaseInput) => Promise<Purchase>;
  updatePurchase: (id: string, input: PurchaseInput) => Promise<Purchase>;
  removePurchase: (id: string) => Promise<void>;
  addItem: (purchaseId: string, input: PurchaseItemInput) => Promise<Purchase>;
  updateItem: (
    purchaseId: string,
    itemId: string,
    input: PurchaseItemInput,
  ) => Promise<Purchase>;
  removeItem: (purchaseId: string, itemId: string) => Promise<Purchase>;
  duplicatePurchase: (id: string) => Promise<Purchase>;
  resetAll: () => Promise<void>;
}

const AppDataContext = createContext<AppDataValue | null>(null);

const appVersion = Constants.expoConfig?.version ?? '0.1.0';

function sortPurchases(purchases: Purchase[]): Purchase[] {
  return [...purchases].sort((a, b) => {
    const byDate = b.purchasedAt.localeCompare(a.purchasedAt);
    return byDate !== 0 ? byDate : b.createdAt.localeCompare(a.createdAt);
  });
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [repo, setRepo] = useState<AppRepository | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguageState] = useState<Language>('es');
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [accent, setAccentState] = useState<Accent>('lavanda');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextRepo = await createAppRepository();
      const [nextPurchases, savedTheme, savedAccent, savedLanguage] = await Promise.all([
        nextRepo.purchases.list(),
        nextRepo.settings.get('theme'),
        nextRepo.settings.get('accent'),
        nextRepo.settings.get('language'),
      ]);
      setRepo(nextRepo);
      setPurchases(sortPurchases(nextPurchases));
      setThemeState(savedTheme === 'dark' ? 'dark' : 'light');
      setAccentState(
        ACCENTS.includes(savedAccent as Accent) ? (savedAccent as Accent) : 'lavanda',
      );
      setLanguageState(savedLanguage === 'en' ? 'en' : 'es');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : es.errors.load);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial desde el repositorio local
    void load();
  }, [load]);

  const requireRepo = useCallback((): AppRepository => {
    if (!repo) throw new Error('La base de datos todavía no está lista.');
    return repo;
  }, [repo]);

  const upsert = useCallback((purchase: Purchase) => {
    setPurchases((current) =>
      sortPurchases([purchase, ...current.filter((item) => item.id !== purchase.id)]),
    );
  }, []);

  const retry = useCallback(async () => {
    await load();
  }, [load]);

  const setTheme = useCallback(
    async (mode: ThemeMode) => {
      await requireRepo().settings.set('theme', mode);
      setThemeState(mode);
    },
    [requireRepo],
  );

  const setLanguage = useCallback(
    async (nextLanguage: Language) => {
      await requireRepo().settings.set('language', nextLanguage);
      setLanguageState(nextLanguage);
    },
    [requireRepo],
  );

  const setAccent = useCallback(
    async (nextAccent: Accent) => {
      await requireRepo().settings.set('accent', nextAccent);
      setAccentState(nextAccent);
    },
    [requireRepo],
  );

  const createPurchase = useCallback(
    async (input: PurchaseInput) => {
      const created = await requireRepo().purchases.create(input);
      upsert(created);
      return created;
    },
    [requireRepo, upsert],
  );

  const updatePurchase = useCallback(
    async (id: string, input: PurchaseInput) => {
      const updated = await requireRepo().purchases.update(id, input);
      upsert(updated);
      return updated;
    },
    [requireRepo, upsert],
  );

  const removePurchase = useCallback(
    async (id: string) => {
      await requireRepo().purchases.remove(id);
      setPurchases((current) => current.filter((purchase) => purchase.id !== id));
    },
    [requireRepo],
  );

  const addItem = useCallback(
    async (purchaseId: string, input: PurchaseItemInput) => {
      const updated = await requireRepo().purchases.addItem(purchaseId, input);
      upsert(updated);
      return updated;
    },
    [requireRepo, upsert],
  );

  const updateItem = useCallback(
    async (purchaseId: string, itemId: string, input: PurchaseItemInput) => {
      const updated = await requireRepo().purchases.updateItem(purchaseId, itemId, input);
      upsert(updated);
      return updated;
    },
    [requireRepo, upsert],
  );

  const removeItem = useCallback(
    async (purchaseId: string, itemId: string) => {
      const updated = await requireRepo().purchases.removeItem(purchaseId, itemId);
      upsert(updated);
      return updated;
    },
    [requireRepo, upsert],
  );

  const duplicatePurchase = useCallback(
    async (id: string) => {
      const source = purchases.find((purchase) => purchase.id === id);
      if (!source) throw new Error('No encontramos esa compra.');

      const repository = requireRepo();
      let copy = await repository.purchases.create({
        title: `${source.title}${
          language === 'en' ? en.purchase.duplicateSuffix : es.purchase.duplicateSuffix
        }`,
        purchasedAt: todayIsoDate(),
        merchant: source.merchant,
        category: source.category,
        notes: source.notes,
      });

      for (const item of source.items) {
        copy = await repository.purchases.addItem(copy.id, {
          name: item.name,
          quantityMilli: item.quantityMilli,
          unit: item.unit,
          unitPriceClp: item.unitPriceClp,
        });
      }

      upsert(copy);
      return copy;
    },
    [language, purchases, requireRepo, upsert],
  );

  const resetAll = useCallback(async () => {
    const repository = requireRepo();
    await repository.destroy();
    setRepo(null);
    setPurchases([]);
    await load();
  }, [load, requireRepo]);

  const value = useMemo<AppDataValue>(
    () => ({
      mode: repo?.mode ?? null,
      loading,
      error,
      purchases,
      appVersion,
      language,
      setLanguage,
      theme,
      accent,
      colors: themeColors(theme, accent),
      setTheme,
      setAccent,
      retry,
      createPurchase,
      updatePurchase,
      removePurchase,
      addItem,
      updateItem,
      removeItem,
      duplicatePurchase,
      resetAll,
    }),
    [
      addItem,
      createPurchase,
      duplicatePurchase,
      error,
      loading,
      purchases,
      removeItem,
      removePurchase,
      repo?.mode,
      resetAll,
      retry,
      setAccent,
      setLanguage,
      setTheme,
      theme,
      accent,
      language,
      updateItem,
      updatePurchase,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData debe usarse dentro de AppDataProvider.');
  return value;
}
