export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
}

export interface ChartData {
  timestamp: number;
  price: number;
  ema30: number | null;
}

const COINGECKO_API = "https://api.coingecko.com/api/v3";

const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

const getFromCache = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const parsed: CacheItem<T> = JSON.parse(item);
    if (Date.now() - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch (e) {
    return null;
  }
};

const setCache = <T>(key: string, data: T) => {
  try {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (e) {
    console.warn("Failed to save to cache", e);
  }
};

export const getCoins = async (): Promise<CoinData[]> => {
  const CACHE_KEY = "coins_list";
  const cached = getFromCache<CoinData[]>(CACHE_KEY);
  if (cached) return cached;

  // Fetch top coins to get ID, symbol, image, current price (as reference, though we use EMA)
  const response = await fetch(
    `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch coins");
  }
  const data = response.json();
  data.then((d) => setCache(CACHE_KEY, d));
  return data;
};

export const getCoinHistory = async (
  coinId: string,
  days: number = 365
): Promise<ChartData[]> => {
  const CACHE_KEY = `history_${coinId}_${days}`;
  const cached = getFromCache<ChartData[]>(CACHE_KEY);
  if (cached) return cached;

  const response = await fetch(
    `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
  );
  if (!response.ok) {
    if (response.status === 429) {
      throw { status: 429, message: "Rate limit exceeded" };
    }
    throw new Error("Failed to fetch history");
  }
  const data = await response.json();
  const prices: [number, number][] = data.prices;

  // Calculate 30-day EMA
  const k = 2 / (30 + 1);
  let ema = prices[0][1]; // Start with SMA or first price

  // For better accuracy, usually we start with SMA of first N days, but for simplicity here we'll start with first price
  // and let it converge over the year of data.

  const result = prices.map(([timestamp, price]) => {
    ema = price * k + ema * (1 - k);
    return {
      timestamp,
      price,
      ema30: ema,
    };
  });

  setCache(CACHE_KEY, result);
  return result;
};
