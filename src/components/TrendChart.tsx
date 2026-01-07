import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ChartData } from '../services/cryptoService';
import { format } from 'date-fns';

interface TrendChartProps {
  data: ChartData[];
  color?: string;
}

export const TrendChart = ({ data, color = "#2563eb" }: TrendChartProps) => {
  if (!data || data.length === 0) return <div className="h-[400px] flex items-center justify-center text-muted-foreground">No data available</div>;

  // Filter out null EMAs (first 30 days might be null/inaccurate if we calculated strictly, but our service returns approximations from start)
  const validData = data.filter(d => d.ema30 !== null);

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={validData}>
          <defs>
            <linearGradient id="colorEma" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(timestamp) => format(new Date(timestamp), 'MMM d')}
            minTickGap={50}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            domain={['auto', 'auto']}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length && label) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Date
                        </span>
                        <span className="font-bold text-muted-foreground">
                          {format(new Date(label), 'MMM d, yyyy')}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                          Calm Price
                        </span>
                        <span className="font-bold text-primary">
                          ${payload[0].value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey="ema30"
            stroke={color}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorEma)"
            isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
