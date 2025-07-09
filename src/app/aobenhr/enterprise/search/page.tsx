'use client';

import React, { useState, useCallback, useEffect } from 'react';
import axios from '@/lib/api/axios';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PencilIcon, Search as SearchIcon, Trash2 } from 'lucide-react';
import { EnterpriseFieldsMap, EnterpriseInfo } from '@/lib/types';
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from '@/components/ui/table';
import { parseLocalDateToUTCDate, parseUTCDateToLocalDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

function EnterpriseCard({ data, fieldLabels, onSave }: { data: EnterpriseInfo, fieldLabels: Record<string, string>, onSave: (d: EnterpriseInfo) => void }) {
  const [localData, setLocalData] = useState<EnterpriseInfo>(data);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const fields = Object.entries(localData).filter(([k]) => !['id', 'created_at', 'updated_at', 'deleted_at'].includes(k));

  const handleSaveAll = async () => {
    // 检查数据是否有修改
    const hasChanges = Object.keys(localData).some(key => {
      const typedKey = key as keyof EnterpriseInfo;
      return JSON.stringify(localData[typedKey]) !== JSON.stringify(data[typedKey]);
    });

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
                {fields.map(([key, value], idx) => (
                  <TableRow
                    key={key}
                    className={idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}
                  >
                    <TableCell className="font-medium text-gray-700 w-1/3">
                      {fieldLabels[key] || key}
                    </TableCell>
                    <TableCell className="w-2/3">
                      <div className="flex items-center justify-between">
                      {key === 'business_scope' ? (
                      <Textarea
                              value={value}
                              onChange={(e) => setLocalData(prev => ({ ...prev, [key]: e.target.value }))}
                              className="flex-1"
                      />
                      ) : (
                      <Input
                              value={value}
                              onChange={(e) => setLocalData(prev => ({ ...prev, [key]: e.target.value }))}
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

export default function EnterpriseSearchPage() {
  const [enterprises, setEnterprises] = useState<EnterpriseInfo[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedEnterprise, setSelectedEnterprise] = useState<EnterpriseInfo | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [enterpriseToDelete, setEnterpriseToDelete] = useState<EnterpriseInfo | null>(null);

  // map the full 
  const fieldLabels: Record<string, string> = EnterpriseFieldsMap;

  // 过滤后的企业数据
  const filteredEnterprises = enterprises;

  const getLogs = useCallback(async () => {
    try {
      if (searchText.length > 0) {
        const { data } = await axios.get<EnterpriseInfo[]>("/api/search/enterprise/raw", { params: { q: searchText } })
        const companies = data || []
        companies.forEach(company => {
          company.establishment_date = parseUTCDateToLocalDate(company.establishment_date || '')
        });
        setEnterprises(companies)
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setEnterprises([]);
    }
  }, [searchText]);

  const handleSearch = () => {
    getLogs();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSaveEnterprise = async (data: EnterpriseInfo) => {
    try {
      data.establishment_date = parseLocalDateToUTCDate(data.establishment_date || '');
      console.log('data', data);
      const { data: resp } = await axios.post('/api/search/enterprise/raw/save', data);
      if (resp.error) {
        toast.error(
          `保存失败: ${resp.message}`
        );
      } else {
        toast.success('保存成功');
        setIsEditDialogOpen(false);
        getLogs();
      }
      
    } catch (error) {
      console.error('Error saving enterprise:', error);
    }
  };

  const handleDeleteEnterprise = async () => {
    if (!enterpriseToDelete) return;
    
    try {
      const { data: resp } = await axios.delete(`/api/search/enterprise/raw/${enterpriseToDelete.id}`);
      if (resp.error) {
        toast.error(`删除失败: ${resp.message}`);
      } else {
        toast.success('删除成功');
        setIsDeleteDialogOpen(false);
        getLogs();
      }
    } catch (error) {
      console.error('Error deleting enterprise:', error);
      toast.error('删除失败，请稍后重试');
    }
  };

  return (
    <>
      <PageHeader title="企业查询" parentPath="/aobenhr" parentTitle="后台管理" />
      <Separator />
      <div className="w-full h-full mx-auto py-0 px-4 bg-gray-50">
        <div className="flex flex-col gap-8">
          <div
            key="企业查询"
            className="w-full flex flex-col bg-gray-50 rounded-lg border-none shadow-none py-6 my-2"
          >
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="请输入企业名称"
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
            </div>
            <div className="flex-1 flex flex-col">
              {enterprises.length > 0 ? (
                <div className="rounded-md border-none shadow-none">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-100">
                        <TableHead>
                          <div className="space-y-2">
                            <div className="font-medium">企业名称</div>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="space-y-2">
                            <div className="font-medium">统一社会信用代码</div>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="space-y-2">
                            <div className="font-medium">法定代表人</div>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="space-y-2">
                            <div className="font-medium">电话</div>
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="space-y-2">
                            <div className="font-medium">邮箱</div>
                          </div>
                        </TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEnterprises.map((enterprise, idx) => (
                        <TableRow
                          key={enterprise.id}
                          className={
                            idx % 2 === 0
                              ? 'bg-white hover:bg-gray-50'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }
                        >
                          <TableCell >{enterprise.company_name}</TableCell>
                          <TableCell>{enterprise.credit_code}</TableCell>
                          <TableCell>{enterprise.legal_representative}</TableCell>
                          <TableCell>{enterprise.phone}</TableCell>
                          <TableCell>{enterprise.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedEnterprise(enterprise);
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
                                  setEnterpriseToDelete(enterprise);
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
                  {filteredEnterprises.length === 0 && enterprises.length > 0 && (
                    <div className="text-center text-gray-500 py-8">
                      没有找到匹配的数据，请调整搜索条件
                    </div>
                  )}
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
            <DialogTitle className="text-xl font-semibold">编辑企业信息</DialogTitle>
          </DialogHeader>
          <div className="py-0">
            {selectedEnterprise && (
              <EnterpriseCard
                data={selectedEnterprise}
                fieldLabels={fieldLabels}
                onSave={handleSaveEnterprise}
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
              确定要删除吗？此操作不可恢复。
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
              onClick={handleDeleteEnterprise}
            >
              确认删除
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
