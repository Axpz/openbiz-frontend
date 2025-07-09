import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar"

interface SortExportMenubarProps {
  onSort?: (type: 'establishment_date' | 'registered_capital', order: 'asc' | 'desc') => void;
  onExport?: (type: 'local' | 'oss') => void;
}

export function SortExportMenubar({ onSort, onExport }: SortExportMenubarProps) {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger className="cursor-pointer hover:text-blue-500">排序</MenubarTrigger>
        <MenubarContent>
          <div className="flex items-center justify-between px-2 py-1 text-sm">
            <span className="mr-4 text-md">成立时间</span>
            <div className="flex items-center gap-1">
              <MenubarItem className="flex-1 justify-center px-1 py-1 rounded-md hover:bg-blue-50 cursor-pointer" onClick={() => onSort?.('establishment_date', 'desc')}>晚到早</MenubarItem>
              <MenubarItem className="flex-1 justify-center px-1 py-1 rounded-md hover:bg-blue-50 cursor-pointer" onClick={() => onSort?.('establishment_date', 'asc')}>早到晚</MenubarItem>
            </div>
          </div>
          <div className="flex items-center justify-between px-2 py-1 text-sm">
            <span className="mr-4 text-md">注册资本</span>
            <div className="flex items-center gap-1">
              <MenubarItem className="flex-1 justify-center px-1 py-1 rounded-md hover:bg-blue-50 cursor-pointer" onClick={() => onSort?.('registered_capital', 'desc')}>高到低</MenubarItem>
              <MenubarItem className="flex-1 justify-center px-1 py-1 rounded-md hover:bg-blue-50 cursor-pointer" onClick={() => onSort?.('registered_capital', 'asc')}>低到高</MenubarItem>
            </div>
          </div>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu >
        <MenubarTrigger className="cursor-pointer hover:text-blue-500" onClick={() => onExport?.('oss')}>导出</MenubarTrigger>
        {/* <MenubarContent>
          <MenubarItem onClick={() => onExport?.('local')}>导出到本地</MenubarItem>
          <MenubarItem onClick={() => onExport?.('oss')}>导出到OSS</MenubarItem>
        </MenubarContent> */}
      </MenubarMenu>
    </Menubar>
  );
}
