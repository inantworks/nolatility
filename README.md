# Nolatility

**Nolatility** is an experimental crypto dashboard designed to reduce the emotional impact of market volatility. Instead of showing live, fluctuating spot prices, it displays a **90-day Exponential Moving Average (EMA)**, helping users focus on long-term trends rather than short-term noise.

## Features

- **Calm Price Display**: Shows the 90-day EMA for crypto assets.
- **Trend-Only Charts**: Visualizes the smoothed price trend without daily noise.
- **Market Overview**: Lists top cryptocurrencies with their calculated "Calm Price".
- **Focus on Wellness**: Designed for users who check prices too often, encouraging a healthier relationship with their investments.

## Tech Stack

- **Framework**: React with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Data Source**: CoinGecko API

## Getting Started

1.  **Clone the repository**

    ```bash
    git clone https://github.com/inantworks/nolatility.git
    cd nolatility
    ```

2.  **Install dependencies**

    ```bash
    npm install
    ```

3.  **Run the development server**

    ```bash
    npm run dev
    ```

4.  **Open in browser**
    Navigate to `http://localhost:5173` to view the app.

## Development

- **Proxy**: The app uses a local proxy in development (`vite.config.ts`) to route API requests through `/api/coingecko` to avoid CORS issues with the CoinGecko API.
- **EMA Calculation**: The 30-day EMA is calculated client-side based on historical daily data fetched from CoinGecko.

## License

AGPL-3.0
