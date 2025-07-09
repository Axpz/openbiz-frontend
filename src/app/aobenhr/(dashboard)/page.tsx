'use client'

import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import axios from "@/lib/api/axios";
import { PageHeader } from "@/components/page-header";
import { Separator } from "@/components/ui/separator";
import { AuthCheck } from "@/components/auth-check";

interface DailySearchData {
  date: string;
  count: number;
}

interface ElasticsearchBucket {
  key_as_string: string;
  key: number;
  doc_count: number;
}

export default function Page() {
  const [data, setData] = useState<DailySearchData[]>([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await axios.get("/api/search/stats/daily-counts");
        const json = res.data;
        
        // Get the last 30 days
        const endDate = new Date();
        const startDate = subDays(endDate, 30); // 29 days ago to include today
        
        // Create array of all dates in the range
        const allDates = eachDayOfInterval({ start: startDate, end: endDate });
        
        // Create a map of existing data
        const existingDataMap = new Map(
          json.aggregations.daily_searches.buckets.map((bucket: ElasticsearchBucket) => [
            bucket.key_as_string,
            bucket.doc_count
          ])
        );
        
        // Create complete dataset with zero values for missing dates
        const chartData: DailySearchData[] = allDates.map(date => ({
          date: format(date, 'yyyy-MM-dd'),
          count: Number(existingDataMap.get(format(date, 'yyyy-MM-dd'))) || 0
        }));
        
        setData(chartData);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <AuthCheck requireAdmin>
      <PageHeader title="Dashboard" />
      <Separator />
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <Card className="w-full h-full flex flex-col items-center justify-center border-none shadow-none bg-gray-50">
        <CardContent className="w-full h-full flex flex-col items-center justify-center p-6 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4 mt-4">最近30天搜索次数</h2>
          <div className="w-full h-full flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-2" />
                <span className="text-muted-foreground">加载中...</span>
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <span className="text-muted-foreground">暂无数据</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={data} margin={{ top: 20, right: 40, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date: string) => format(new Date(date), "MM/dd")}
                    tick={{ fontSize: 12 }}
                    interval={0}
                    minTickGap={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    labelFormatter={(label: string) => format(new Date(label), "yyyy-MM-dd")}
                    formatter={(value: number) => [`${value} 次`, '搜索次数']}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#2563eb"
                    fill="none"
                    strokeWidth={2}
                    dot={{ r: 4, stroke: '#2563eb', strokeWidth: 2, fill: '#fff' }}
                    activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
    </AuthCheck>
  );
}
