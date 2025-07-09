import { ExcelImport } from "@/components/excel-import";
import { PageHeader } from "@/components/page-header";
import { Separator } from "@/components/ui/separator";

export default function ImportPage() {
  return (
    <>
      <PageHeader title="数据导入" /> 
      <Separator />
      <div className="w-full h-full mx-auto py-0 px-0 bg-gray-50">
        <ExcelImport />
      </div>
    </>
  );
} 