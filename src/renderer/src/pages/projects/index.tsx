import ProjectCard from './project-card'
import AddProject from './add-project'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { fetchProjectList } from '../../services/api/fetch-projects-list'
import { useProjectListStore } from '../../stores/useProjectListStore'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import LinkProjectDrawer from './link-project-drawer'

export default function Projects() {
  const { organizationName: organization, isLoggedIn } = useAuthStore()
  const { projectList } = useProjectListStore()
  const navigate = useNavigate()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [idTiLick, setIdToLink] = useState<string | null>(null)

  useQuery({
    queryKey: [organization, 'projects'],
    queryFn: () => (isLoggedIn ? fetchProjectList() : []),
    refetchOnWindowFocus: false
  })

  return (
    <div className="flex flex-col min-h-[calc(100vh-7vh)] w-full items-center justify-center px-4 ">
      <div className="flex flex-1 flex-col justify-center gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projectList.map((project, index) => (
            <ProjectCard
              id={project.id}
              key={index}
              title={project.name}
              description={project.description}
              data={[
                {
                  name: 'New Error',
                  value: project.errorCount,
                  variant: 'destructive'
                },
                {
                  name: 'Code Suggestion',
                  value: project.codeSuggestionCount,
                  variant: 'default'
                },
                {
                  name: 'Total Error Resolved',
                  value: project.totalErrorResolved,
                  variant: 'outline'
                }
              ]}
              isLinkedToRemote={project.isConnectedToRemote}
              remoteUrl={project.remoteUrl}
              onOpenProject={() => {
                navigate(`/${organization}/projects/${project.id}/log-analysis/explorer`)
              }}
              onOpenTerminal={() => {
                setIsDrawerOpen(true)
                setIdToLink(project.id)
              }}
            />
          ))}
        </div>
      </div>

      <LinkProjectDrawer
        open={isDrawerOpen}
        onOpenChange={(bool) => {
          setIsDrawerOpen(bool)
          // calling the function to refetch the project list after linking the project to update the button "open/link to remote"
          fetchProjectList()
        }}
        projectId={idTiLick}
      />

      <div className="flex flex-1 flex-col justify-center gap-4 p-4 ">
        <AddProject />
      </div>
    </div>
  )
}
