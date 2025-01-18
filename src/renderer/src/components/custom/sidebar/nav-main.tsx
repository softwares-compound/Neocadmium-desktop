import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '../../ui/sidebar'
import { Badge } from '../../ui/badge'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../../../stores/useAuthStore'

export function NavMain({
  items
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      badge?: string
    }[]
  }[]
}) {
  const navigate = useNavigate()
  const { organizationName: organization } = useAuthStore()
  const { project_id } = useParams()
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu className="cursor-default">
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                onClick={() =>
                  navigate(
                    `/${organization}/projects/${project_id}/${item.url}/${item.items?.length ? item.items[0].url : ''}`
                  )
                }
              >
                <div>
                  <item.icon />
                  <span>{item.title}</span>
                </div>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <div
                              className="ml-1 flex justify-between items-center gap-2"
                              onClick={() =>
                                navigate(
                                  `/${organization}/projects/${project_id}/${item.url}/${subItem.url}`
                                )
                              }
                            >
                              <span>
                                <span>{subItem.title}</span>
                              </span>
                              {subItem.badge && (
                                <Badge
                                  variant={
                                    subItem.badge === 'new'
                                      ? 'default'
                                      : subItem.badge === 'beta'
                                        ? 'secondary'
                                        : 'outline'
                                  }
                                >
                                  {subItem.badge}
                                </Badge>
                              )}
                            </div>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
