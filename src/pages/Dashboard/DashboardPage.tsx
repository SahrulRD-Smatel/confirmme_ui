import { useEffect, useState, useMemo } from 'react';
import api from '@/api/axiosClient';
import { Card, CardContent } from '@/components/ui/card/Card';
import { useAuthStore } from '@/store/useAuthStore';
import {  CheckCircle2, XCircle, Clock } from 'lucide-react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

import FullscreenSpinner  from "@/components/ui/spinner/FullscreenSpinner";

interface SummaryData {
  approved: number;
  rejected: number;
  pending: number;
}

interface ApprovalStat {
  month: string;
  approved: number;
  rejected: number;
}

const bgColors = {
  green: 'bg-green-100 dark:bg-green-900',
  red: 'bg-red-100 dark:bg-red-900',
  yellow: 'bg-yellow-100 dark:bg-yellow-900',
  blue: 'bg-blue-100 dark:bg-blue-900',
};

const textColors = {
  green: 'text-green-600 dark:text-green-400',
  red: 'text-red-600 dark:text-red-400',
  yellow: 'text-yellow-500 dark:text-yellow-400',
  blue: 'text-blue-600 dark:text-blue-400',
};

const DashboardPage = () => {
  const { role, isLoading } = useAuthStore();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [approvalStats, setApprovalStats] = useState<ApprovalStat[]>([]);
  const [waitingCount, setWaitingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // state for dark mode detection (listens to <html> class)
  const [isDark, setIsDark] = useState(
    typeof window !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  const token = useMemo(() => localStorage.getItem('token'), []);

  useEffect(() => {
    if (isLoading || !role || !token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [summaryRes, statsRes, waitingRes] = await Promise.all([
          api.get<SummaryData>('/dashboard', { headers }),
          api.get<ApprovalStat[]>('/dashboard/approval-monthly-by-type', { headers }),
          api.get<{ count: number }>('/dashboard/waiting-approval', { headers }),
        ]);

        if (summaryRes.status === 200) setSummary(summaryRes.data);
        if (statsRes.status === 200) setApprovalStats(statsRes.data);
        if (waitingRes.status === 200) setWaitingCount(waitingRes.data.count);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoading, role, token]);

  // Listen to dark mode toggle on <html> element class changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const chartOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: 'bar',
        toolbar: { show: false },
        foreColor: '#64748b',
        zoom: { enabled: false },
        animations: { enabled: true },
      },
      theme: {
        mode: isDark ? 'dark' : 'light',
      },
      plotOptions: {
        bar: { borderRadius: 6, horizontal: false, columnWidth: '50%' },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: approvalStats.map((stat) => stat.month),
        labels: { style: { colors: '#64748b', fontWeight: 600 } },
      },
      yaxis: {
        labels: { style: { colors: '#64748b' } },
        min: 0,
        forceNiceScale: true,
      },
      colors: ['#22c55e', '#ef4444'],
      grid: { borderColor: '#e5e7eb' },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        fontWeight: 600,
      },
    }),
    [approvalStats, isDark]
  );

  const chartSeries = useMemo(
    () => [
      {
        name: 'Approved',
        data: approvalStats.map((stat) => stat.approved),
      },
      {
        name: 'Rejected',
        data: approvalStats.map((stat) => stat.rejected),
      },
    ],
    [approvalStats]
  );

  if (isLoading || loading || !summary) {
    return (
      <div className="flex justify-center items-center flex-1 min-h-screen bg-white dark:bg-gray-900">
              {loading && <FullscreenSpinner />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 ">
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Left column: Summary Cards + Requests Waiting for Approval */}
        <div className="col-span-12 space-y-6 xl:col-span-7">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                label: 'Approved',
                value: summary.approved,
                icon: <CheckCircle2 className="text-green-500 w-5 h-5" />,
                color: 'green' as const,
              },
              {
                label: 'Rejected',
                value: summary.rejected,
                icon: <XCircle className="text-red-500 w-5 h-5" />,
                color: 'red' as const,
              },
              {
                label: 'Waiting',
                value: summary.pending,
                icon: <Clock className="text-yellow-400 w-5 h-5" />,
                color: 'yellow' as const,
              },
              {
                label: 'Total Requests',
                value: summary.approved + summary.rejected + summary.pending,
                icon: (
                  <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    ∑
                  </div>
                ),
                color: 'blue' as const,
              },
            ].map(({ label, value, icon, color }) => (
              <Card
                key={label}
                className="bg-white dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-xl transition-shadow duration-300 cursor-default"
              >
                <CardContent className="flex flex-col items-center py-4 px-4">
                  <div
                    className={`${bgColors[color]} p-2 rounded-full mb-2 flex items-center justify-center`}
                  >
                    {icon}
                  </div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {label}
                  </p>
                  <h2 className={`text-xl font-extrabold mt-1 ${textColors[color]}`}>{value}</h2>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Requests Waiting for Your Approval */}
          {role !== 'Staff' && (
            <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-smx2 font-semibold mb-1">Requests Waiting for Your Approval</h2>
                <p className="text-gray-700 dark:text-gray-300 text-base text-sm">
                  Ada{' '}
                  <span className="font-bold text-yellow-500">{waitingCount}</span> permintaan yang menunggu persetujuan Anda.
                </p>
              </div>
              <button
                onClick={() => (window.location.href = '/approval-inbox')}
                className="bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-2 px-5 rounded-md shadow-md transition-colors duration-300"
              >
                Lihat Sekarang
              </button>
            </Card>
          )}
        </div>

        {/* Right column: Statistik Approval Bulanan */}
        <div className="col-span-12 xl:col-span-5">
          {(role === 'HRD' || role === 'Manager' || role === 'Direktur') && approvalStats.length > 0 && (
            <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-smx2 font-semibold mb-6 text-center">Statistik Approval Bulanan</h2>
              <Chart options={chartOptions} series={chartSeries} type="bar" height={320} className="mx-auto" />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
