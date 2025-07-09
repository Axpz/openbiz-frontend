import React, { useState, useCallback, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AvailableSearcherOptions } from '@/lib/types';
import {
  FilterState,
  defaultFilterState,
  getAvailableOptions,
  toggleArrayItem,
  resetFilterState,
} from '@/components/filter-bar';

interface MobileFilterDialogProps {
  onOpenChange: (open: boolean) => void;
  availableSearcherOptions?: AvailableSearcherOptions;
  onFilterChange?: (filterState: FilterState) => void;
  initialFilterState?: FilterState;
  provinceCityMap?: Record<string, string[]>;
}

export function MobileFilterDialog({
  onOpenChange,
  availableSearcherOptions,
  onFilterChange,
  initialFilterState,
  provinceCityMap = {},
}: MobileFilterDialogProps) {
  const options = getAvailableOptions(availableSearcherOptions);

  const [filterState, setFilterState] = useState<FilterState>(
    initialFilterState ?? defaultFilterState
  );

  useEffect(() => {
    if (initialFilterState) {
      setFilterState(initialFilterState);
    }
  }, [initialFilterState]);

  const updateFilterState = useCallback((updates: Partial<FilterState>) => {
    setFilterState((prev: FilterState) => {
      const newState = { ...prev, ...updates };
      return newState;
    });
  }, []);

  const toggle = useCallback((val: string, arr: string[], setArr: (a: string[]) => void) => {
    setArr(toggleArrayItem(val, arr));
  }, []);

  // 处理省份选择 - 只能选择一个省份
  const handleProvinceSelect = useCallback((province: string) => {
    const isSelected = filterState.selectedProvinces.includes(province);
    if (isSelected) {
      // 如果已选中，则取消选择
      updateFilterState({ 
        selectedProvinces: [], 
        activeProvince: '',
        selectedCities: [] 
      });
    } else {
      // 如果未选中，则替换为当前选择的省份
      updateFilterState({ 
        selectedProvinces: [province], 
        activeProvince: province,
        selectedCities: [] 
      });
    }
  }, [filterState.selectedProvinces, updateFilterState]);

  // 处理城市选择
  const handleCitySelect = useCallback((city: string) => {
    const newSelectedCities = toggleArrayItem(city, filterState.selectedCities);
    updateFilterState({ selectedCities: newSelectedCities });
  }, [filterState.selectedCities, updateFilterState]);

  const renderCheckboxGroup = useCallback((
    items: string[],
    selectedItems: string[],
    onToggle: (item: string) => void,
    title: string,
    className?: string
  ) => (
    <div className={`space-y-3 ${className ?? ''}`}>
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map(item => (
          <label
            key={item}
            className="flex items-center gap-2 text-sm font-normal transition-colors cursor-pointer text-gray-700"
          >
            <Checkbox
              checked={selectedItems.includes(item)}
              onCheckedChange={() => onToggle(item)}
              className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <span className="truncate">{item}</span>
          </label>
        ))}
      </div>
    </div>
  ), []);

  const renderButtonGroup = useCallback((
    items: string[],
    selectedItems: string[],
    onToggle: (item: string) => void,
    title: string,
    className?: string
  ) => (
    <div className={`space-y-3 ${className ?? ''}`}>
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <Button
            key={item}
            variant="outline"
            size="sm"
            className={`transition-colors text-sm font-normal ${
              selectedItems.includes(item)
                ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                : 'text-gray-700 hover:text-blue-500'
            }`}
            onClick={() => onToggle(item)}
          >
            {item}
          </Button>
        ))}
      </div>
    </div>
  ), []);

  // 渲染城市选择组
  const renderCityGroup = useCallback(() => {
    if (!filterState.activeProvince) return null;
    
    const cities = provinceCityMap[filterState.activeProvince] || [];
    if (cities.length === 0) return null;

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-900">城市地区</h3>
        <div className="flex flex-wrap gap-2">
          {cities.map(city => (
            <Button
              key={city}
              variant="outline"
              size="sm"
              className={`transition-colors text-sm font-normal ${
                filterState.selectedCities.includes(city)
                  ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600'
                  : 'text-gray-700 hover:text-blue-500'
              }`}
              onClick={() => handleCitySelect(city)}
            >
              {city}
            </Button>
          ))}
        </div>
      </div>
    );
  }, [filterState.activeProvince, filterState.selectedCities, provinceCityMap, handleCitySelect]);

  // 重置按钮 - 只重置内部状态，不触发搜索
  const handleReset = () => {
    const resetState = resetFilterState();
    setFilterState(resetState);
    // onFilterChange?.(resetState);
  };

  // 应用筛选 - 只在点击"应用筛选"时才触发搜索并关闭弹窗
  const handleApply = () => {
    onFilterChange?.(filterState);
    onOpenChange(false);
  };

  return (
    <div className="w-screen max-w-none top-full rounded-b-2xl p-0 bg-white">
      {/* 顶部栏美化：居中筛选+图标+下拉 */}
      {/* <div className="flex items-center justify-center relative py-3 border-b bg-white">
        <Filter className="mr-1" size={18} />
        <span className="font-semibold text-base">筛选</span>
        <ChevronDown className="ml-1" size={16} />
      </div> */}
      {/* 内容区域，原内容不变，仅加内边距和滚动 */}
      <div className="flex-1 max-h-[60vh] overflow-y-auto px-4 py-3 bg-white">
        <div className="space-y-6">
            {/* 查找范围 */}
            {renderCheckboxGroup(
              options.searchScope,
              filterState.selectedScopes,
              (item) => toggle(item, filterState.selectedScopes, (newVal) => updateFilterState({ selectedScopes: newVal })),
              '查找范围'
            )}
            <Separator />
            {/* 省份地区 */}
            {renderButtonGroup(
              options.provinces,
              filterState.selectedProvinces,
              handleProvinceSelect,
              '省份地区'
            )}
            {/* 城市地区 - 只在选择省份后显示 */}
            {filterState.activeProvince && (
              <>{renderCityGroup()}</>
            )}
            <Separator />
            {/* 国标行业 */}
            {renderButtonGroup(
              options.industries,
              filterState.selectedIndustries,
              (item) => toggle(item, filterState.selectedIndustries, (newVal) => updateFilterState({ selectedIndustries: newVal })),
              '国标行业'
            )}
            <Separator />
            {/* 成立年限 */}
            {renderCheckboxGroup(
              options.yearRanges,
              filterState.selectedYearRanges,
              (item) => toggle(item, filterState.selectedYearRanges, (newVal) => updateFilterState({ selectedYearRanges: newVal })),
              '成立年限'
            )}
            <Separator />
            {/* 包含信息 */}
            {renderButtonGroup(
              options.phoneEmailWebsite,
              filterState.selectedPhoneEmailWebsite,
              (item) => toggle(item, filterState.selectedPhoneEmailWebsite, (newVal) => updateFilterState({ selectedPhoneEmailWebsite: newVal })),
              '包含信息'
            )}
          </div>
        </div>
      {/* 底部按钮区美化 */}
      <div className="flex gap-3 p-4 border-t bg-gray-50">
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex-1"
        >
          重置
        </Button>
        <Button
          onClick={handleApply}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
        >
          应用筛选
        </Button>
      </div>
    </div>
  );
} 