"use client"
import * as React from "react"
import {
  Settings,
  CreditCard,
  Users,
  Search,
  Database,
  Package,
  FileInput,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

const data = {
  user: { 
    name: "Admin",
    email: "admin@example.com",
    avatar: "/favicon.ico",
  },
  navMain: [
    {
      title: "网站设置",
      url: "/aobenhr/settings",
      icon: Settings,
    },
    {
      title: "商户配置",
      url: "/aobenhr/merchant",
      icon: CreditCard,
      items: [
        {
          title: "微信商户",
          url: "/aobenhr/merchant/wechat",
        },
        {
          title: "支付宝商户",
          url: "/aobenhr/merchant/alipay",
        },
      ],
    },
    {
      title: "用户管理",
      url: "/aobenhr/users",
      icon: Users,
      items: [
        {
          title: "注册记录",
          url: "/aobenhr/users/registrations",
        },
        {
          title: "付款记录",
          url: "/aobenhr/users/payments",
        },
        {
          title: "导出记录",
          url: "/aobenhr/users/exports",
        },
      ],
    },
    {
      title: "搜词统计",
      url: "/aobenhr/search",
      icon: Search,
      items: [
        {
          title: "统计报表",
          url: "/aobenhr/search/stats",
        }
      ],
    },
    {
      title: "企业管理",
      url: "/aobenhr/enterprise",
      icon: Database,
      items: [
        {
          title: "企业查询",
          url: "/aobenhr/enterprise/search",
        }
      ],
    },
    {
      title: "数据导入",
      url: "/aobenhr/import",
      icon: FileInput ,
    },
    {
      title: "套餐设置",
      url: "/aobenhr/packages",
      icon: Package,
      items: [
        {
          title: "支付套餐",
          url: "/aobenhr/packages/settings",
        }
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="offcanvas" className="bg-white" {...props}>
      <SidebarHeader className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 py-4">
          <h1 className="text-2xl font-semibold tracking-tight">后台管理</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} activePath={pathname} />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  )
}