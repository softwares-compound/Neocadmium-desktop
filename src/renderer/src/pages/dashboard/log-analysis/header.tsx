import React from 'react'
import { SidebarTrigger } from '../../../components/ui/sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '../../../components/ui/breadcrumb'
import { Separator } from '../../../components/ui/separator'
import ReloadWithTimestamp from '../../../components/custom/global/last-reload'
import { useAuthStore } from '../../../stores/useAuthStore'
import { useParams } from 'react-router-dom'

type Submodule = 'explorer' | 'analyze' | 'configure'

const Header: React.FC = () => {
  const { organizationName: organization } = useAuthStore()
  const { submodule } = useParams<{ submodule: Submodule }>() // Treat as a string to handle unmatched cases
  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${organization.toLowerCase()}/projects`}>
                  Projects
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{organization}</BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  Log analysis |{' '}
                  {submodule ? submodule[0].toLocaleUpperCase() + submodule.slice(1) : ''}
                </BreadcrumbPage>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage></BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div>
          <ReloadWithTimestamp />
        </div>
      </div>
    </header>
  )
}

export default Header
