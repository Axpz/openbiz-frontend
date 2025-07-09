import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { toast } from 'sonner';

export interface ConfigVariable {
  key: string;
  label: string;
  placeholder: string;
  showDelete?: boolean;
}

export interface ConfigGroup {
  title: string;
  description: string;
  variables: ConfigVariable[];
}

interface ConfigTableProps {
  groups: ConfigGroup[];
  defaultValues: Record<string, string>;
  onSave?: (groupTitle: string, values: Record<string, string>) => Promise<void>;
  fetchConfig?: () => Promise<Record<string, string>>;
}

export function ConfigTable({ groups, defaultValues, onSave, fetchConfig }: ConfigTableProps) {
  const [values, setValues] = useState<Record<string, string>>({ ...defaultValues });
  const [originalValues, setOriginalValues] = useState<Record<string, string>>({ ...defaultValues });
  const [editKey, setEditKey] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (fetchConfig) {
      fetchConfig().then(cfgValues => {
        setValues({ ...cfgValues });
        setOriginalValues({ ...cfgValues });
      });
    }
  }, [fetchConfig]);

  const handleEdit = (key: string) => {
    setEditKey(key);
    setInputValue(values[key] || '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues(prev => ({ ...prev, [e.target.name]: e.target.value }))
  };

  const handleSave = (key: string) => {
    setValues(prev => ({ ...prev, [key]: inputValue }));
    setEditKey(null);
  };

  const handleCancel = () => {
    setEditKey(null);
  };

  const handleDelete = (key: string, groupTitle: string) => {
    setValues(prev => {
      const newValues = { ...prev };
      delete newValues[key];
      return newValues;
    });
    const groupIdx = groups.findIndex(g => g.title === groupTitle);
    if (groupIdx !== -1) {
      const group = groups[groupIdx];
      const idx = group.variables.findIndex(v => v.key === key);
      if (idx !== -1) {
        group.variables.splice(idx, 1);
      }
    }
    if (editKey === key) setEditKey(null);
  };

  const handleGroupSave = async (group: ConfigGroup) => {
    const groupVars = group.variables.map(v => v.key);
    const postData = Object.fromEntries(
      Object.entries(values).filter(([k]) => groupVars.includes(k))
    );
    
    // Check if any values have changed
    const hasChanges = groupVars.some(key => values[key] !== originalValues[key]);
    
    if (!hasChanges) {
      toast.info('当前数据未修改');
      return;
    }
    
    if (onSave) {
      await onSave(group.title, postData);
      // Update original values after successful save
      setOriginalValues(prev => ({ ...prev, ...postData }));
    }
  };

  return (
    <div className="w-full h-full mx-auto py-10 px-4 bg-gray-50">
      <div className="flex flex-col gap-8">
        {groups.map(group => (
          <div
            key={group.title}
            className="w-full flex flex-col bg-gray-50 rounded-lg border-none shadow-none py-6 my-2"
          >
            <div className="px-8 pb-4">
              <div className="font-bold text-lg">{group.title}</div>
              <div className="text-gray-500 text-sm mt-1">{group.description}</div>
            </div>
            <div className="px-4 flex-1 flex flex-col">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead className="w-1/4 text-gray-700">变量名</TableHead>
                    <TableHead className="w-1/2 text-gray-700">变量值</TableHead>
                    {/* <TableHead className="w-1/4 text-gray-700 text-center">操作</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.variables.map((v, idx) => (
                    <TableRow
                      key={v.key}
                      className={
                        idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
                      }
                    >
                      <TableCell className="font-medium text-gray-700 align-middle">
                        {v.label}
                      </TableCell>
                      <TableCell className="align-middle">
                          <Input
                            className="w-full min-w-0"
                            name={v.key}
                            value={values[v.key] || ''}
                            onChange={handleInputChange}
                            placeholder={v.placeholder}
                          />
                      </TableCell>
                      {/* <TableCell className="align-middle">
                        {editKey === v.key ? (
                          <Input
                            className="w-full min-w-0"
                            value={inputValue}
                            onChange={handleInputChange}
                            placeholder={v.placeholder}
                            autoFocus
                          />
                        ) : (
                          <span className="text-gray-900 truncate block">{values[v.key]}</span>
                        )}
                      </TableCell>
                       <TableCell className="text-center align-middle">
                        {editKey === v.key ? (
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-800"
                              onClick={() => handleSave(v.key)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-500 hover:text-gray-700"
                              onClick={handleCancel}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-500 hover:text-gray-700"
                              onClick={() => handleEdit(v.key)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            {v.showDelete && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(v.key, group.title)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end px-8 pt-6 mt-auto">
              <Button
                size="lg"
                className="bg-blue-500 hover:bg-blue-600 text-white"
                variant="default"
                onClick={() => handleGroupSave(group)}
              >
                确认
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 