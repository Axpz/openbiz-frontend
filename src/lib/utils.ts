import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isWeChatBrowser() {
  return /micromessenger/i.test(navigator.userAgent);
}

export function isMobileBrowser() {
  return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent.toLowerCase()
  );
}

export function formatTime(t?: string | number | Date): string {
  if (!t) return '-';
  return new Date(t).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function parseUTCDateToLocalDate(utcDateStr: string): string {
  if (!utcDateStr || utcDateStr === '-') return '-';
  return new Date(utcDateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function parseLocalDateToUTCDate(localDateStr: string): string {
  if (!localDateStr) return '';

  // 兼容 "YYYY-MM-DD" 或 "YYYY/MM/DD"
  const normalized = localDateStr.replace(/-/g, '/');

  // 构造本地时间 00:00:00 的 Date 对象
  const localDate = new Date(normalized + ' 00:00:00');

  // 获取本地时区偏移（单位：分钟），如东八区是 -480 分钟
  const timezoneOffset = localDate.getTimezoneOffset();

  // 转为 UTC 时间戳（毫秒）
  const utcTimestamp = localDate.getTime() - timezoneOffset * 60 * 1000;

  // 构造 UTC Date 对象，并转为 ISO 字符串
  return new Date(utcTimestamp).toISOString();
}

export function extractCompanyAbbreviation(fullName: string): string {
  // 定义常见的企业组织形式后缀
  const suffixes = ['有限公司', '有限责任公司', '股份有限公司', '集团有限公司', '控股有限公司', '公司', '厂', '店', '部', '行', '中心', '研究院', '事务所', '协会', '学会', '商会', '促进会', '联合会', '基金会'];
    
  // 按最长匹配原则删除后缀
  let nameWithoutSuffix = fullName;
  suffixes.sort((a, b) => b.length - a.length).some(suffix => {
      if (nameWithoutSuffix.endsWith(suffix)) {
          nameWithoutSuffix = nameWithoutSuffix.slice(0, -suffix.length);
          return true;
      }
      return false;
  });
  
  // 定义省级行政区列表
  const provinces = ['北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江', '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南', '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州', '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆', '台湾', '香港', '澳门'];
  
  // 删除省份名称
  let nameWithoutProvince = nameWithoutSuffix;
  provinces.some(province => {
      if (nameWithoutProvince.startsWith(province)) {
          nameWithoutProvince = nameWithoutProvince.slice(province.length);
          return true;
      }
      return false;
  });
  
  // 定义常见城市列表（简化版）
  const cities = ['石家庄', '唐山', '秦皇岛', '邯郸', '邢台', '保定', '张家口', '承德', '沧州', '廊坊', '衡水', '太原', '大同', '阳泉', '长治', '晋城', '朔州', '晋中', '运城', '忻州', '临汾', '吕梁', '呼和浩特', '包头', '乌海', '赤峰', '通辽', '鄂尔多斯', '呼伦贝尔', '巴彦淖尔', '乌兰察布', '沈阳', '大连', '鞍山', '抚顺', '本溪', '丹东', '锦州', '营口', '阜新', '辽阳', '盘锦', '铁岭', '朝阳', '葫芦岛', '长春', '吉林', '四平', '辽源', '通化', '白山', '松原', '白城', '哈尔滨', '齐齐哈尔', '鸡西', '鹤岗', '双鸭山', '大庆', '伊春', '佳木斯', '七台河', '牡丹江', '黑河', '绥化', '南京', '无锡', '徐州', '常州', '苏州', '南通', '连云港', '淮安', '盐城', '扬州', '镇江', '泰州', '宿迁', '杭州', '宁波', '温州', '嘉兴', '湖州', '绍兴', '金华', '衢州', '舟山', '台州', '丽水', '合肥', '芜湖', '蚌埠', '淮南', '马鞍山', '淮北', '铜陵', '安庆', '黄山', '滁州', '阜阳', '宿州', '巢湖', '六安', '亳州', '池州', '宣城', '福州', '厦门', '莆田', '三明', '泉州', '漳州', '南平', '龙岩', '宁德', '南昌', '景德镇', '萍乡', '九江', '新余', '鹰潭', '赣州', '吉安', '宜春', '抚州', '上饶', '济南', '青岛', '淄博', '枣庄', '东营', '烟台', '潍坊', '济宁', '泰安', '威海', '日照', '莱芜', '临沂', '德州', '聊城', '滨州', '菏泽', '郑州', '开封', '洛阳', '平顶山', '安阳', '鹤壁', '新乡', '焦作', '濮阳', '许昌', '漯河', '三门峡', '南阳', '商丘', '信阳', '周口', '驻马店', '武汉', '黄石', '十堰', '宜昌', '襄樊', '鄂州', '荆门', '孝感', '荆州', '黄冈', '咸宁', '随州', '长沙', '株洲', '湘潭', '衡阳', '邵阳', '岳阳', '常德', '张家界', '益阳', '郴州', '永州', '怀化', '娄底', '广州', '深圳', '珠海', '汕头', '佛山', '韶关', '河源', '梅州', '惠州', '汕尾', '东莞', '中山', '江门', '阳江', '湛江', '茂名', '肇庆', '清远', '潮州', '揭阳', '云浮', '南宁', '柳州', '桂林', '梧州', '北海', '防城港', '钦州', '贵港', '玉林', '百色', '贺州', '河池', '来宾', '崇左', '海口', '三亚', '三沙', '儋州', '重庆', '成都', '自贡', '攀枝花', '泸州', '德阳', '绵阳', '广元', '遂宁', '内江', '乐山', '南充', '眉山', '宜宾', '广安', '达州', '雅安', '巴中', '资阳', '贵阳', '六盘水', '遵义', '安顺', '毕节', '铜仁', '昆明', '曲靖', '玉溪', '保山', '昭通', '丽江', '普洱', '临沧', '拉萨', '西安', '铜川', '宝鸡', '咸阳', '渭南', '延安', '汉中', '榆林', '安康', '商洛', '兰州', '嘉峪关', '金昌', '白银', '天水', '武威', '张掖', '平凉', '酒泉', '庆阳', '定西', '陇南', '西宁', '银川', '石嘴山', '吴忠', '固原', '中卫', '乌鲁木齐', '克拉玛依', '吐鲁番', '哈密', '台北', '高雄', '基隆', '台中', '台南', '新竹', '嘉义', '拉萨', '日喀则', '昌都', '林芝', '山南', '那曲', '阿里', '石河子', '阿拉尔', '图木舒克', '五家渠', '北屯', '铁门关', '双河', '可克达拉', '昆玉', '香港', '澳门'];
  
  // 删除城市名称
  let nameWithoutCity = nameWithoutProvince;
  cities.some(city => {
      if (nameWithoutCity.startsWith(city)) {
          nameWithoutCity = nameWithoutCity.slice(city.length);
          return true;
      }
      return false;
  });
  
  // 进一步处理可能的"市"、"地区"、"自治州"等行政后缀
  const citySuffixes = ['省','市', '地区', '自治州', '盟', '特别行政区'];
  let finalName = nameWithoutCity;
  citySuffixes.some(suffix => {
      if (finalName.startsWith(suffix)) {
          finalName = finalName.slice(suffix.length);
          return true;
      }
      return false;
  });
  
  // 移除括号及括号内的内容
  finalName = finalName.replace(/[\(\（][^）\)]*[\)\）]/g, '');
  
  // 新增：过滤掉含有"中国"的简称
  finalName = finalName.replace('中国', '');
  
  // 限制输出长度为4个字符
  return finalName.length > 4 ? finalName.substring(0, 4) : finalName;
}
