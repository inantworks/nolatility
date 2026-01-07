import { cn } from '../lib/utils';

interface CryptoCardProps {
  name: string;
  symbol: string;
  image: string;
  calmPrice: number | null;
  onClick: () => void;
  isSelected: boolean;
}

export const CryptoCard = ({ name, symbol, image, calmPrice, onClick, isSelected }: CryptoCardProps) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md",
        isSelected ? "border-primary ring-1 ring-primary" : "border-border"
      )}
    >
      <div className="flex items-center space-x-4">
        <img src={image} alt={name} className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-muted-foreground uppercase">{symbol}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tracking-tight">
            {calmPrice ? (
              `$${calmPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            ) : (
              <span className="text-base font-normal text-muted-foreground animate-pulse">Loading...</span>
            )}
          </div>
          {calmPrice && (
            <div className="flex items-center justify-end space-x-1 text-xs text-muted-foreground">
              <span>Calm Price (30d EMA)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
