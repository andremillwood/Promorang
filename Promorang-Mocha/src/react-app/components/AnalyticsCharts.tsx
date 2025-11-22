import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Color palette for charts
const COLORS = {
  primary: '#f97316', // orange-500
  secondary: '#8b5cf6', // violet-500
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444', // red-500
  info: '#3b82f6', // blue-500
  purple: '#a855f7', // purple-500
  pink: '#ec4899', // pink-500
  cyan: '#06b6d4', // cyan-500
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.success,
  COLORS.info,
  COLORS.purple,
  COLORS.pink,
  COLORS.warning,
  COLORS.danger,
  COLORS.cyan
];

interface EarningsChartProps {
  data: Array<{
    date: string;
    earnings: number;
    gems?: number;
    points?: number;
  }>;
  height?: number;
}

export function EarningsChart({ data, height = 300 }: EarningsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={COLORS.success} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="date" 
          stroke="#64748b"
          fontSize={12}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          labelFormatter={(value) => new Date(value).toLocaleDateString()}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Earnings']}
        />
        <Area
          type="monotone"
          dataKey="earnings"
          stroke={COLORS.success}
          strokeWidth={2}
          fill="url(#earningsGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface PerformanceMetricsProps {
  data: Array<{
    metric: string;
    value: number;
    change?: number;
  }>;
  height?: number;
}

export function PerformanceMetrics({ data, height = 300 }: PerformanceMetricsProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis type="number" stroke="#64748b" fontSize={12} />
        <YAxis 
          type="category" 
          dataKey="metric" 
          stroke="#64748b" 
          fontSize={12}
          width={100}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number) => [value.toLocaleString(), 'Value']}
        />
        <Bar 
          dataKey="value" 
          fill={COLORS.primary}
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface ActivityBreakdownProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  height?: number;
}

export function ActivityBreakdown({ data, height = 300 }: ActivityBreakdownProps) {
  const dataWithColors = data.map((item, index) => ({
    ...item,
    color: item.color || CHART_COLORS[index % CHART_COLORS.length]
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={dataWithColors}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {dataWithColors.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number) => [value.toLocaleString(), 'Count']}
        />
        <Legend 
          verticalAlign="middle" 
          align="right"
          layout="vertical"
          iconType="circle"
          wrapperStyle={{ fontSize: '12px', paddingLeft: '20px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface TrendLineProps {
  data: Array<{
    date: string;
    value: number;
    secondary?: number;
  }>;
  height?: number;
  primaryKey?: string;
  secondaryKey?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export function TrendLine({ 
  data, 
  height = 200, 
  primaryKey = 'value',
  secondaryKey,
  primaryColor = COLORS.primary,
  secondaryColor = COLORS.secondary
}: TrendLineProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="date" 
          stroke="#64748b"
          fontSize={12}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          labelFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <Line
          type="monotone"
          dataKey={primaryKey}
          stroke={primaryColor}
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
        {secondaryKey && (
          <Line
            type="monotone"
            dataKey={secondaryKey}
            stroke={secondaryColor}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

interface MultiMetricChartProps {
  data: Array<{
    date: string;
    [key: string]: string | number;
  }>;
  metrics: Array<{
    key: string;
    name: string;
    color: string;
  }>;
  height?: number;
}

export function MultiMetricChart({ data, metrics, height = 300 }: MultiMetricChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="date" 
          stroke="#64748b"
          fontSize={12}
          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          labelFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <Legend />
        {metrics.map((metric) => (
          <Line
            key={metric.key}
            type="monotone"
            dataKey={metric.key}
            stroke={metric.color}
            strokeWidth={2}
            name={metric.name}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon?: React.ReactNode;
  trend?: Array<{ date: string; value: number }>;
}

export function KPICard({ title, value, change, changeType, icon, trend }: KPICardProps) {
  const changeColor = changeType === 'increase' ? 'text-green-600' : 'text-red-600';
  const changeIcon = changeType === 'increase' ? '↗' : '↘';

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {icon && <div className="text-gray-600">{icon}</div>}
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        </div>
        {change !== undefined && (
          <span className={`text-sm font-medium ${changeColor} flex items-center space-x-1`}>
            <span>{changeIcon}</span>
            <span>{Math.abs(change)}%</span>
          </span>
        )}
      </div>
      
      <div className="mb-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>

      {trend && trend.length > 0 && (
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={changeType === 'increase' ? COLORS.success : COLORS.danger}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export { COLORS, CHART_COLORS };
