// src/services/stats.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const STATS_KEY = 'gg_stats_v1';

export type Stats = {
  ecoActions: number; // số hành động xanh đã tick "tôi đã làm"
};

const defaultStats: Stats = {
  ecoActions: 0,
};

export async function getStats(): Promise<Stats> {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats;
    const parsed = JSON.parse(raw);
    return {
      ecoActions:
        typeof parsed.ecoActions === 'number' ? parsed.ecoActions : 0,
    };
  } catch {
    return defaultStats;
  }
}

async function saveStats(stats: Stats) {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // bỏ qua lỗi ghi bộ nhớ
  }
}

export async function incrementEcoActions(): Promise<Stats> {
  const current = await getStats();
  const updated: Stats = {
    ...current,
    ecoActions: current.ecoActions + 1,
  };
  await saveStats(updated);
  return updated;
}
