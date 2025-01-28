import { CLOUD_AXIOS_INSTANCE, LOCAL_AXIOS_INSTANCE } from '../../axios/axios'
import { useProjectListStore } from '../../stores/useProjectListStore'
import { ProjectList } from '../../types/type'
import { sendMessage } from '../../socket/socket'

export const fetchProjectList = async (): Promise<ProjectList | undefined> => {
  const { setLoading, setProjectList } = useProjectListStore.getState()
  const cd_id = localStorage.getItem('cd_id') ?? ''
  const cd_secret = localStorage.getItem('cd_secret') ?? ''
  try {
    setLoading(true)
    const response = await CLOUD_AXIOS_INSTANCE.get('/applications', {
      headers: {
        'Content-Type': 'application/json',
        'CD-ID': cd_id,
        'CD-Secret': cd_secret
      }
    })
    const projects = response.data
    const projectList: ProjectList = projects.map((project: any) => ({
      id: project._id.$oid,
      name: project.application_name,
      description: project.description,
      errorCount: project.error_count ?? 0,
      codeSuggestionCount: project.code_suggestion_count ?? 0,
      totalErrorResolved: project.total_error_resolved ?? 0
    }))
    const organization_id = localStorage.getItem('organization_id') ?? ''
    const projectListWithRemoteUrl = await LOCAL_AXIOS_INSTANCE.post(
      `/project/check_remote_link`,
      { projectList, organization_id },
      {
        headers: {
          'Content-Type': 'application/json',
          'CD-ID': cd_id,
          'CD-Secret': cd_secret
        }
      }
    )
    // console.log(projectListWithRemoteUrl.data.list)
    setProjectList(projectListWithRemoteUrl.data.list)
    sendMessage({
            type: 'authenticate',
            cd_id: cd_id,
            cd_secret: cd_secret,
            organization_id: organization_id
          })
    return projectList
  } catch (error) {
    console.error('Error fetching projects:', error)
    return undefined
  } finally {
    setLoading(false)
  }
}
