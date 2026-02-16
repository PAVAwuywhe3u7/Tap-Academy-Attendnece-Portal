import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const baseTooltip = {
  contentStyle: {
    background: 'var(--chart-tooltip-bg)',
    border: '1px solid var(--chart-tooltip-border)',
    borderRadius: '14px',
    color: 'var(--chart-tooltip-text)'
  }
};

export const EmployeeActivityChart = ({ data = [] }) => (
  <div className="glass-card h-80 p-5">
    <h3 className="mb-4 font-display text-lg text-white">Last 7 Days Activity</h3>
    <ResponsiveContainer width="100%" height="86%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
        <XAxis dataKey="date" tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} />
        <YAxis tick={{ fill: 'var(--chart-axis)' }} />
        <Tooltip {...baseTooltip} />
        <Bar dataKey="totalHours" radius={[10, 10, 0, 0]} fill="#38bdf8" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export const WeeklyTrendChart = ({ data = [] }) => (
  <div className="glass-card h-80 p-5">
    <h3 className="mb-4 font-display text-lg text-white">Weekly Attendance Trend</h3>
    <ResponsiveContainer width="100%" height="86%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
        <XAxis dataKey="date" tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} />
        <YAxis tick={{ fill: 'var(--chart-axis)' }} />
        <Tooltip {...baseTooltip} />
        <Legend wrapperStyle={{ color: 'var(--chart-axis)' }} />
        <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="late" stroke="#facc15" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="absent" stroke="#fb7185" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const PIE_COLORS = ['#0ea5e9', '#10b981', '#facc15', '#fb7185', '#a78bfa', '#fb923c'];

export const DepartmentPieChart = ({ data = [] }) => (
  <div className="glass-card h-80 p-5">
    <h3 className="mb-4 font-display text-lg text-white">Department-wise Attendance</h3>
    <ResponsiveContainer width="100%" height="86%">
      <PieChart>
        <Tooltip {...baseTooltip} />
        <Legend wrapperStyle={{ color: 'var(--chart-axis)' }} />
        <Pie data={data} dataKey="value" nameKey="department" innerRadius={55} outerRadius={90} paddingAngle={3}>
          {data.map((entry, index) => (
            <Cell key={`dept-${entry.department}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  </div>
);
