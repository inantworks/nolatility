import { useState, useEffect } from 'react';
import { getCoins, getCoinHistory, type CoinData, type ChartData } from './services/cryptoService';
import { CryptoCard } from './components/CryptoCard';
import { TrendChart } from './components/TrendChart';
import { Activity } from 'lucide-react';

const getCalmPrice = (historyData: ChartData[]) => {
  if (historyData.length === 0) return null;
  const lastPoint = historyData[historyData.length - 1];
  return lastPoint.ema30 || lastPoint.price; // Fallback to price if EMA not ready (rare after 1 year fetch)
};

function App() {
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [history, setHistory] = useState<ChartData[]>([]);
  const [calmPrices, setCalmPrices] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const data = await getCoins();
        setCoins(data);
        if (data.length > 0) {
          setSelectedCoin(data[0]);
        }

        // Fetch histories for all coins to display calm prices in the list
        const fetchAllHistories = async () => {
          for (const coin of data) {
            try {
              // The service now handles rate limiting and queueing
              const historyData = await getCoinHistory(coin.id);
              const calm = getCalmPrice(historyData);
              setCalmPrices(prev => ({ ...prev, [coin.id]: calm }));
            } catch (e) {
              console.error(`Failed to fetch history for ${coin.id}`, e);
            }
          }
        };

        fetchAllHistories();

      } catch (error) {
        console.error('Failed to fetch coins', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  useEffect(() => {
    if (selectedCoin) {
      const fetchHistory = async () => {
        setLoadingHistory(true);
        // Reset history while loading new data to avoid showing old coin's price
        setHistory([]);
        try {
          const data = await getCoinHistory(selectedCoin.id);
          setHistory(data);
        } catch (error) {
          console.error('Failed to fetch history', error);
        } finally {
          setLoadingHistory(false);
        }
      };

      fetchHistory();
    }
  }, [selectedCoin]);

  const currentCalmPrice = history.length > 0 ? getCalmPrice(history) : null;

  return (
    <div className="min-h-screen bg-background p-8 font-mono text-foreground tracking-tighter">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="mb-12 pt-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Activity className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">nolatility</h1>
            </div>
            <p className="max-w-2xl text-xl font-light leading-relaxed text-muted-foreground">
              This is an experiment to help people who check prices too often. By focusing on the <span className="font-medium text-foreground decoration-primary/30 underline decoration-2 underline-offset-4">30-day trend</span> instead of live spot prices, we aim to reduce the emotional impact of market volatility.
            </p>
          </div>
        </header>

        <main className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-lg font-semibold tracking-tight">Market Overview</h2>
            {loading ? (
               <div className="space-y-4">
                 {[1, 2, 3].map((i) => (
                   <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
                 ))}
               </div>
            ) : (
              <div className="space-y-4">
                {coins.map((coin) => (
                  <CryptoCard
                    key={coin.id}
                    name={coin.name}
                    symbol={coin.symbol}
                    image={coin.image}
                    calmPrice={calmPrices[coin.id] || null} 
                    onClick={() => setSelectedCoin(coin)}
                    isSelected={selectedCoin?.id === coin.id}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm sticky top-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-bold">{selectedCoin?.name} Trend</h2>
                   <p className="text-muted-foreground">30-Day EMA (The "Calm Price")</p>
                </div>
                <div className="text-right">
                   <div className="text-3xl font-bold text-primary">
                     {currentCalmPrice ? (
                       `$${currentCalmPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                     ) : (
                       <span className="text-xl text-muted-foreground font-normal">Calculating...</span>
                     )}
                   </div>
                </div>
              </div>
              
              {loadingHistory ? (
                <div className="flex h-[400px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <TrendChart data={history} color="hsl(var(--primary))" />
              )}
            </div>
          </div>
        </main>
        
        <footer className="mt-20 border-t pt-10">
           <h2 className="mb-8 text-2xl font-bold tracking-tight">Frequently Asked Questions</h2>
           <div className="grid gap-6 md:grid-cols-2">
             <div className="space-y-2">
               <h3 className="font-semibold text-lg">What is a "Calm Price"?</h3>
               <p className="text-muted-foreground">
                 It's the 30-day Exponential Moving Average (EMA) of the asset. This smooths out daily price spikes and dips to show you the true underlying trend.
               </p>
             </div>
             <div className="space-y-2">
               <h3 className="font-semibold text-lg">Why no live prices?</h3>
               <p className="text-muted-foreground">
                 Live prices trigger emotional reactions. By updating slower and filtering noise, we help you make rational long-term decisions instead of panic-buying or selling.
               </p>
             </div>
             <div className="space-y-2">
               <h3 className="font-semibold text-lg">Is this real data?</h3>
               <p className="text-muted-foreground">
                 Yes, we use real market data from CoinGecko. We just process it to filter out the noise before showing it to you.
               </p>
             </div>
             <div className="space-y-2">
               <h3 className="font-semibold text-lg">How do I read the trend?</h3>
               <p className="text-muted-foreground">
                 The curve shows the 30-day smoothed price. An upward slope indicates a positive long-term trend, while a downward slope indicates a cooling off period.
               </p>
             </div>
           </div>
           
           <div className="mt-16 text-center text-sm text-muted-foreground">
             Made by <a href="https://x.com/inantworks" target="_blank" rel="noreferrer" className="font-medium text-foreground hover:underline">inant</a>
           </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
