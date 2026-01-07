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

export const getCoins = async (): Promise<CoinData[]> => {
  // Fetch top coins to get ID, symbol, image, current price (as reference, though we use EMA)
  const response = await fetch(
    `${COINGECKO_API}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch coins");
  }
  return response.json();
};

export const getCoinHistory = async (
  coinId: string,
  days: number = 365
): Promise<ChartData[]> => {
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

  return prices.map(([timestamp, price]) => {
    ema = price * k + ema * (1 - k);
    return {
      timestamp,
      price,
      ema30: ema,
    };
  });
};
