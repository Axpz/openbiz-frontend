import React, { useState, useCallback, useRef } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
// import { DateRangePicker } from '@/components/date-range-picker';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AvailableSearcherOptions } from '@/lib/types';
import { DateRange } from 'react-day-picker';
// import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

// 默认数据
export const defaultSearchScope = ['企业名称', '经营范围', '法定代表人', '地址'];
export const defaultProvinces = ['广东省', '江苏省', '山东省', '浙江省', '北京市', '上海市', '天津市', '重庆市', '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省', '福建省', '江西省', '河南省', '湖北省', '湖南省', '海南省', '四川省', '贵州省', '云南省', '陕西省', '甘肃省', '青海省', '台湾省', '内蒙古自治区', '广西壮族自治区', '西藏自治区', '宁夏回族自治区', '新疆维吾尔自治区', '香港特别行政区', '澳门特别行政区'];
export const defaultIndustries = ['农、林、牧、渔业', '制造业', '建筑业', '批发和零售业'];
export const defaultYearRanges = ['3个月内', '半年内', '1年内', '1-3年', '3-5年', '5-10年', '10年以上'];
export const defaultPhoneEmailWebsite = ['电话', '邮箱', '网址'];

export const DEFAULT_VISIBLE_PROVINCES = 8;

// 筛选状态类型定义
export interface FilterState {
  selectedScopes: string[];
  selectedProvinces: string[];
  selectedIndustries: string[];
  selectedYearRanges: string[];
  dateRangeEnabled: boolean;
  dateRange: DateRange | undefined;
  orgOpen: boolean;
  showMore: boolean;
  provinceOpen: boolean;
  selectedOrgStructureType: string[];
  selectedOrgEconomicType: string[];
  orgStructureInclude: boolean;
  orgEconomicInclude: boolean;
  selectedPhoneEmailWebsite: string[];
  activeProvince: string;
  selectedCities: string[];
}

// 默认筛选状态
export const defaultFilterState: FilterState = {
  selectedScopes: [],
  selectedProvinces: [],
  selectedIndustries: [],
  selectedYearRanges: [],
  dateRangeEnabled: false,
  dateRange: undefined,
  orgOpen: true,
  showMore: true,
  provinceOpen: false,
  selectedOrgStructureType: [],
  selectedOrgEconomicType: [],
  orgStructureInclude: true,
  orgEconomicInclude: true,
  selectedPhoneEmailWebsite: [],
  activeProvince: '',
  selectedCities: [],
};

// 获取可用的筛选选项
export function getAvailableOptions(availableSearcherOptions?: AvailableSearcherOptions) {
  return {
    searchScope: availableSearcherOptions?.searchScope ?? defaultSearchScope,
    provinces: availableSearcherOptions?.provinces ?? defaultProvinces,
    industries: availableSearcherOptions?.industries ?? defaultIndustries,
    yearRanges: availableSearcherOptions?.yearRanges ?? defaultYearRanges,
    phoneEmailWebsite: availableSearcherOptions?.phoneEmailWebsite ?? defaultPhoneEmailWebsite,
  };
}

// 通用工具函数
export function toggleArrayItem<T>(val: T, arr: T[]): T[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

// 重置筛选状态
export function resetFilterState(): FilterState {
  return { ...defaultFilterState };
} 

export const FilterBar: React.FC<{
  availableSearcherOptions?: AvailableSearcherOptions;
  provinceCityMap: Record<string, string[]>;
  onFilterChange?: (filterState: FilterState) => Promise<void> | void;
}> = ({ availableSearcherOptions, provinceCityMap, onFilterChange }) => {
  const options = getAvailableOptions(availableSearcherOptions);

  const [filterState, setFilterState] = useState<FilterState>(defaultFilterState);

  // 使用 useRef 来跟踪上一次的状态
  const prevStateRef = useRef<FilterState>(filterState);

  // 简化的状态更新函数
  const updateFilterState = useCallback((updates: Partial<FilterState>) => {
    setFilterState(prev => {
      const newState = { ...prev, ...updates };
      
      // 只在状态真正变化时才触发回调
      if (JSON.stringify(prevStateRef.current) !== JSON.stringify(newState)) {
        prevStateRef.current = newState;
        onFilterChange?.(newState);
      }
      
      return newState;
    });
  }, [onFilterChange]);

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
    className?: string
  ) => (
    <div className={`flex flex-wrap gap-4 ${className ?? ''}`}>
      {items.map(item => (
        <label
          key={item}
          className="flex items-center gap-1 text-base font-normal transition-colors cursor-pointer text-gray-700 hover:text-blue-500"
        >
          <Checkbox
            checked={selectedItems.includes(item)}
            onCheckedChange={() => onToggle(item)}
            className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
          />
          <span>{item}</span>
        </label>
      ))}
    </div>
  ), []);

  const renderButtonGroup = useCallback((
    items: string[],
    selectedItems: string[],
    onToggle: (item: string) => void,
    className?: string
  ) => (
    <div className={`flex flex-wrap gap-2 ${className ?? ''}`}>
      {items.map(item => (
        <Button
          key={item}
          variant="ghost"
          size="sm"
          className={`transition-colors text-base font-normal ${
            selectedItems.includes(item)
              ? 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'
              : 'text-gray-700 hover:text-blue-500'
          }`}
          onClick={() => onToggle(item)}
        >
          {item}
        </Button>
      ))}
    </div>
  ), []);

  // 省份-城市联动渲染
  const renderProvinceCityGroup = () => {
    if (!filterState.activeProvince) return null;
    
    const cities = provinceCityMap[filterState.activeProvince] || [];
    if (cities.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2">
        {cities.map(city => (
          <Button
            key={city}
            variant="ghost"
            size="sm"
            className={`transition-colors text-base font-normal ${
              filterState.selectedCities.includes(city)
                ? 'bg-blue-500 text-white hover:bg-blue-500 hover:text-white'
                : 'text-gray-700 hover:text-blue-500'
            }`}
            onClick={() => handleCitySelect(city)}
          >
            {city}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center flex-wrap gap-4">
        <span className="inline-block w-[5em]">查找范围：</span>
        {renderCheckboxGroup(
          options.searchScope,
          filterState.selectedScopes,
          (item) => toggle(item, filterState.selectedScopes, (newVal) => updateFilterState({ selectedScopes: newVal }))
        )}
      </div>

      <div className="flex items-start flex-wrap gap-4">
        <span className="w-20 pt-2">省份地区：</span>
        <div className="flex-1 flex items-start">
          {renderButtonGroup(
            options.provinces.slice(0, filterState.provinceOpen ? undefined : DEFAULT_VISIBLE_PROVINCES),
            filterState.selectedProvinces,
            handleProvinceSelect,
            'flex-1 pt-1'
          )}
        </div>
      </div>
      
      {filterState.activeProvince && (
        <div className="flex items-start flex-wrap gap-4">
          <span className="w-20 pt-2">城市地区：</span>
          <div className="flex-1 flex items-start">
            {renderProvinceCityGroup()}
          </div>
        </div>
      )}

      <div className="flex items-start flex-wrap gap-4">
        <span className="w-20 pt-2">国标行业：</span>
        {renderButtonGroup(
          options.industries,
          filterState.selectedIndustries,
          (item) => toggle(item, filterState.selectedIndustries, (newVal) => updateFilterState({ selectedIndustries: newVal })),
          'flex-1 pt-1'
        )}
      </div>

      {filterState.showMore && (
        <>
          <div className="flex items-center flex-wrap gap-4">
            <span className="inline-block w-[5em]">成立年限：</span>
            <div className="flex-1 flex items-start">
            {renderCheckboxGroup(
              options.yearRanges,
              filterState.selectedYearRanges,
              (item) => toggle(item, filterState.selectedYearRanges, (newVal) => updateFilterState({ selectedYearRanges: newVal }))
            )}
            </div>
          </div>
          <div className="flex items-center flex-wrap gap-4">
            <span className="inline-block w-[5em]">包&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;含：</span>
            {renderButtonGroup(
              options.phoneEmailWebsite,
              filterState.selectedPhoneEmailWebsite,
              (item) => toggle(item, filterState.selectedPhoneEmailWebsite, (newVal) => updateFilterState({ selectedPhoneEmailWebsite: newVal })),
              'flex-1 pt-1'
            )}
          </div>
        </>
      )}

      <div className="flex justify-center w-full">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-blue-500"
          onClick={() => updateFilterState({ showMore: !filterState.showMore })}
        >
          <span className="inline-block align-middle ml-1">
            {filterState.showMore ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </span>
        </Button>
      </div>
    </div>
  );
};
