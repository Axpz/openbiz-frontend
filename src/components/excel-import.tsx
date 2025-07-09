'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { EnterpriseInfo, SearchFieldsMap } from '@/lib/types';
import axios from '@/lib/api/axios';
import { CheckCircle2, XCircle, FileText, Eye, EyeOff, Loader2 } from 'lucide-react';

interface ExcelData {
  headers: string[];
  rows: (string | number | boolean | null)[][];
  fileName: string;
  status?: 'pending' | 'success' | 'error';
}

export function ExcelImport() {
  const [files, setFiles] = useState<ExcelData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [viewingFileIndex, setViewingFileIndex] = useState<number | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles: ExcelData[] = [];

    setFiles(newFiles);

    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    if (selectedFiles.length > 20) {
      toast.error('最多只能选择20个文件');
      return;
    }

    setIsLoading(true);
    setViewingFileIndex(null);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      try {
        const data = await readExcelFile(file);
        if (data) {
          newFiles.push({ ...data, fileName: file.name, status: 'pending' });
        }
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        toast.error(`处理文件 ${file.name} 时出错`);
      }
    }

    setFiles(newFiles);
    setIsLoading(false);
  };

  const readExcelFile = (file: File): Promise<ExcelData | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = e => {
        try {
          const workbook = XLSX.read(e.target?.result, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length === 0) {
            toast.error(`${file.name} 文件为空`);
            resolve(null);
            return;
          }

          let headerRowIndex = -1;
          let headers: string[] = [];
          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i] as (string | number | boolean | null)[];
            if (row.some(cell => cell === '企业名称')) {
              headerRowIndex = i;
              headers = row as string[];
              break;
            }
          }

          if (headerRowIndex === -1) {
            toast.error(`${file.name} 未找到包含"企业名称"的表头行`);
            resolve(null);
            return;
          }

          const rows = jsonData.slice(headerRowIndex + 1) as (string | number | boolean | null)[][];
          resolve({ headers, rows, fileName: file.name });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('读取文件时出错'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleConfirmImport = async () => {
    if (files.length === 0) {
      toast.error('请先选择文件');
      return;
    }

    // 检查是否所有文件都已成功导入
    const allSuccess = files.every(file => file.status === 'success');
    if (allSuccess) {
      toast.info('所有文件已导入成功，请重新选择文件');
      return;
    }

    setIsImporting(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.status === 'success') continue;

      try {
        const fieldKeys = file.headers.map(col => SearchFieldsMap[col] || '');
        const importData = file.rows.map(row => {
          const info: Record<string, string | undefined> = {};

          // 先处理 establishment_date，如果解析失败则跳过当前行
          const establishmentDateIndex = fieldKeys.findIndex(key => key === 'establishment_date');
          if (establishmentDateIndex !== -1) {
            const date = row[establishmentDateIndex];
            if (!date || typeof date !== 'string') {
              // establishment_date 为空或不是字符串类型，跳过当前行
              return null;
            }
            
            try {
              const parsedDate = new Date(date);
              if (isNaN(parsedDate.getTime())) {
                // 日期解析失败，跳过当前行
                return null;
              }
              
              info.establishment_date = parsedDate.toISOString();
            } catch {
              // 日期解析出错，跳过当前行
              return null;
            }
          }

          // 处理其他字段
          fieldKeys.forEach((fieldName, index) => {
            if (!fieldName || fieldName === 'establishment_date') return;
            info[fieldName] = row[index] ? String(row[index]).trim() : '';
          });

          if (!info.company_name || !info.credit_code || info.company_name === '-') {
            return null;
          }

          return {
            company_name: info.company_name,
            legal_representative: (info.legal_representative || '').substring(0, 10),
            registered_capital: info.registered_capital || '',
            establishment_date: info.establishment_date || '',
            operating_status: info.operating_status || '',
            province: info.province || '',
            city: info.city || '',
            district: info.district || '',
            company_type: info.company_type || '',
            credit_code: info.credit_code,
            tax_number: info.tax_number || '',
            registration_number: info.registration_number || '',
            organization_code: info.organization_code || '',
            phone: info.phone || '',
            industry: info.industry || '',
            address: info.address || '',
            website: info.website || '',
            email: info.email || '',
            business_scope: info.business_scope || ''
          } as EnterpriseInfo;
        }).filter((info): info is EnterpriseInfo => info !== null);

        const resp = await axios.post('/api/import/enterprise', importData, {
          timeout: 300000 // 5分钟超时
        });
        setFiles(prev =>
          prev.map((f, index) =>
            index === i ? { ...f, status: 'success' } : f
          )
        );
        toast.success(`成功导入 ${file.fileName} 的 ${resp.data.imported} 条记录`);
      } catch (error) {
        setFiles(prev =>
          prev.map((f, index) =>
            index === i ? { ...f, status: 'error' } : f
          )
        );
        toast.error(`导入 ${file.fileName} 失败: ${error}`);
      }
    }

    setIsImporting(false);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (viewingFileIndex === index) {
      setViewingFileIndex(null);
    } else if (viewingFileIndex !== null && viewingFileIndex > index) {
      setViewingFileIndex(viewingFileIndex - 1);
    }
  };

  const toggleFileView = async (index: number) => {
    if (isLoadingDetail) return;
    
    if (viewingFileIndex === index) {
      setViewingFileIndex(null);
      return;
    }

    setIsLoadingDetail(true);
    setViewingFileIndex(index);
    
    // 模拟加载延迟，实际项目中可以移除这个setTimeout
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsLoadingDetail(false);
  };

  return (
    <Card className="w-full max-w-[75vw] border-none shadow-none bg-gray-50">
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="default"
              className="px-8 bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isLoading || isImporting || isLoadingDetail}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                '选择 Excel 文件'
              )}
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx,.xls"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            {files.length > 0 && (
              <Button
                variant="default"
                className="px-8 bg-green-500 hover:bg-green-600 text-white"
                onClick={handleConfirmImport}
                disabled={isImporting || isLoadingDetail || files.every(file => file.status === 'success')}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    导入中...
                  </>
                ) : files.every(file => file.status === 'success') ? (
                  '已全部导入'
                ) : (
                  '确认导入'
                )}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {files.map((file, fileIndex) => (
              <div key={fileIndex} className="space-y-2">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <span className="font-medium text-gray-700">{file.fileName}</span>
                    {file.status === 'success' && (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    {file.status === 'error' && (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    {file.status === 'pending' && isImporting && (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFileView(fileIndex)}
                      disabled={isImporting || isLoadingDetail}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      {isLoadingDetail && viewingFileIndex === fileIndex ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          加载中...
                        </>
                      ) : viewingFileIndex === fileIndex ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          隐藏详情
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          查看详情
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(fileIndex)}
                      disabled={isImporting || isLoadingDetail}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      移除
                    </Button>
                  </div>
                </div>
                {viewingFileIndex === fileIndex && !isLoadingDetail && (
                  <div className="relative w-full max-h-[60vh] rounded-md border overflow-x-auto overflow-y-auto">
                    <Table className="border-collapse min-w-[1000px] w-full table-auto">
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          {file.headers.map((header, index) => (
                            <TableHead
                              key={index}
                              className="border border-green-400 bg-green-100 px-4 py-2 text-sm font-bold text-green-900 text-center whitespace-nowrap"
                            >
                              {header}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {file.rows.map((row, rowIndex) => (
                          <TableRow key={rowIndex} className="hover:bg-gray-50">
                            {row.map((cell, cellIndex) => (
                              <TableCell
                                key={cellIndex}
                                className="border border-gray-300 px-4 py-2 text-sm text-gray-800 whitespace-nowrap"
                              >
                                {cell}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
