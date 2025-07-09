'use client';

import React, { useState, useCallback, useEffect } from 'react';
import axios from '@/lib/api/axios';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PencilIcon, Search as SearchIcon, Trash2, PlusIcon } from 'lucide-react';
import { Plan } from '@/lib/types';
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Field labels for Plan
const PlanFieldsMap: Record<string, string> = {
  'name': '套餐名称',
  'description': '套餐描述',
  'price_cents': '价格（元）',
  'duration_days': '时长（天）',
  'daily_limit': '每日导出次数',
  'max_export_count': '单次最大导出(条)',
  'currency': '货币',
  'features': '套餐功能',
  'is_active': '是否激活'
};

interface PlanCardProps {
  data: Plan;
  onSave: (data: Plan) => Promise<void>;
}

function PlanCard({ data, onSave }: PlanCardProps) {
  const [localData, setLocalData] = useState<Plan>(data);
  const [saving, setSaving] = useState(false);
  const [inputValue, setInputValue] = useState((data.price_cents / 100).toString())
  const [featuresInputValue, setFeaturesInputValue] = useState((data.features as string[]).join('\n'))
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const fields = Object.entries(localData).filter(([k]) => !['id', 'created_at', 'updated_at', 'currency'].includes(k));

  const handleSaveAll = async () => {
    const hasChanges = Object.keys(localData).some(key => {
      const typedKey = key as keyof Plan;
      return JSON.stringify(localData[typedKey]) !== JSON.stringify(data[typedKey]);
    });

    console.log(localData);
    if (!hasChanges) {
      toast.info('请修改数据后再保存');
      return;
    }

    setSaving(true);
    try {
      await onSave(localData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full h-full mx-auto py-0 px-0 bg-gray-50">
      <div className="flex flex-col gap-8">
      <Card className="w-full flex flex-col bg-gray-50 rounded-lg border-none shadow-none py-6 my-2">
        <CardContent>
          <Table>
            <TableBody>
              {fields.map(([key, value], idx: number) => (
                <TableRow
                  key={key}
                  className={idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                >
                  <TableCell className="font-medium text-gray-700 w-1/3">
                    {PlanFieldsMap[key] || key}
                  </TableCell>
                  <TableCell className="w-2/3">
                    <div className="flex items-center justify-between">
                      {key === 'is_active' ? (
                        <div className="flex-1">
                          <Switch
                            checked={value as boolean}
                            onCheckedChange={(checked: boolean) => setLocalData(prev => ({ ...prev, [key]: checked }))}
                          />
                          <Label>{value ? '激活' : '未激活'}</Label>
                        </div>
                      ) : key === 'features' ? (
                          <Textarea
                          value={featuresInputValue}  
                          onChange={(e) => setFeaturesInputValue(e.target.value)}
                          onBlur={() => {
                            setLocalData(prev => ({ ...prev, [key]: featuresInputValue.split('\n').map(item => item.trim()).filter(item => item !== '') }))
                          }}
                          className="flex-1"
                          rows={6}
                        />
                      ) : key === 'price_cents' ? (
                        
                        <Input
                          type="number"
                          inputMode="decimal"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onBlur={() => {
                            const num = Number(inputValue)
                            if (!isNaN(num)) {
                              setInputValue(num.toFixed(2)) // 离开时格式化显示
                              setLocalData(prev => ({
                                ...prev,
                                [key]: Math.round(num * 100)
                              }))
                            }
                          }}
                          className="flex-1"
                          step="0.01"
                        />
                      ) : (
                        <Input
                          type={key === 'duration_days' || key === 'daily_limit' || key === 'max_export_count' ? 'number' : 'text'}
                          value={value}
                          onChange={(e) => {
                            const val = key === 'duration_days' || key === 'daily_limit' || key === 'max_export_count'
                              ? Number(e.target.value)
                              : e.target.value;
                            setLocalData(prev => ({ ...prev, [key]: val }));
                          }}
                          className="flex-1"
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end pt-6">
            <Button
              onClick={handleSaveAll}
              disabled={saving}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

export default function PackageSettingsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await axios.get<{plans: Plan[]}>('/api/pricing/plans/all');
      setPlans(response.data.plans);
      setError(null);
    } catch (err) {
      const errorMessage = 'Failed to fetch plans: ' + (err as Error).message;
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSavePlan = async (data: Plan) => {
    try {
      const { data: resp } = await axios.post('/api/pricing/plans', data);
      if (resp.error) {
        toast.error(`保存失败: ${resp.message}`);
      } else {
        toast.success('保存成功');
        setIsEditDialogOpen(false);
        fetchPlans();
      }
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('保存失败，请稍后重试');
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    
    try {
      const { data: resp } = await axios.delete(`/api/pricing/plans/${planToDelete.id}`);
      if (resp.error) {
        toast.error(`删除失败: ${resp.message}`);
      } else {
        toast.success('删除成功');
        setIsDeleteDialogOpen(false);
        fetchPlans();
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('删除失败，请稍后重试');
    }
  };

  const handleSearch = () => {
    // Search is already implemented in filteredPlans
    // This function is kept for consistency with the UI
    // toast.info('搜索完成');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const filteredPlans = plans.filter(plan => 
    plan.name.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return <div className="flex justify-center items-center h-screen">加载中...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  return (
    <>
      <PageHeader title="套餐设置" parentPath="/aobenhr" parentTitle="后台管理" />
      <Separator />
      <div className="w-full h-full mx-auto py-0 px-4 bg-gray-50">
        <div className="flex flex-col gap-8">
          <div
            key="套餐设置"
            className="w-full flex flex-col bg-gray-50 rounded-lg border-none shadow-none py-6 my-2"
          >
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="请输入套餐名称"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="h-9 w-60"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleSearch}
                >
                  <SearchIcon className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    setSelectedPlan({
                      id: 0,
                      name: '',
                      price_cents: 0,
                      duration_days: 30,
                      daily_limit: 10,
                      max_export_count: 10000,
                      is_active: true,
                      created_at: '',
                      updated_at: '',
                      description: '',
                      currency: 'CNY',
                      features: []
                    });
                    setIsEditDialogOpen(true);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                <PlusIcon className="w-4 h-4 mr-2" />
                  添加套餐
                </Button>
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              {filteredPlans.length > 0 ? (
                <div className="rounded-md border-none shadow-none">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead>套餐名称</TableHead>
                        <TableHead>套餐描述</TableHead>
                        <TableHead>价格（元）</TableHead>
                        <TableHead>时长（天）</TableHead>
                        <TableHead>每日导出限制 (次)</TableHead>
                        <TableHead>单次最大导出(条)</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPlans.map((plan, idx) => (
                        <TableRow
                          key={plan.id}
                          className={
                            idx % 2 === 0
                              ? 'bg-white hover:bg-gray-50'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }
                        >
                          <TableCell>{plan.name}</TableCell>
                          <TableCell>{plan.description}</TableCell>
                          <TableCell>{(plan.price_cents/100).toFixed(2)}</TableCell>
                          <TableCell>{plan.duration_days}</TableCell>
                          <TableCell>{plan.daily_limit}</TableCell>
                          <TableCell>{plan.max_export_count}</TableCell>
                          <TableCell>{plan.is_active ? '激活' : '未激活'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedPlan(plan);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <PencilIcon className="w-4 h-4 text-blue-500" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setPlanToDelete(plan);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">暂无数据</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-4 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">
              {selectedPlan?.id ? '编辑套餐' : '添加套餐'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-0">
            {selectedPlan && (
              <PlanCard
                data={selectedPlan}
                onSave={handleSavePlan}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">确认删除</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              确定要删除套餐 &ldquo;{planToDelete?.name}&rdquo; 吗？此操作不可恢复。
            </p>
          </div>
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePlan}
            >
              确认删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
