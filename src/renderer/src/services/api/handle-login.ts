import { toast } from '../../hooks/use-toast'
import { LOCAL_AXIOS_INSTANCE } from '../../axios/axios'
import { useLoginStore } from '../../stores/useLoginStore'
import { validateLoginForm } from '../validation/login-form'
import { useAuthStore } from '../../stores/useAuthStore'
import { sendMessage } from '../../socket/socket'
import { NavigateFunction } from 'react-router-dom'

/**
 * Handles the login process by sending a POST request to the local server
 * and handles the response.
 *
 * @param navigate - The navigate function from react-router-dom.
 * @returns A promise that resolves when the login process is complete.
 */
export const handleLogin = async (navigate: NavigateFunction): Promise<void> => {
  const { setIsLoggedIn, setOrganizationName } = useAuthStore.getState()
  const { formData, setErrors, setLoading } = useLoginStore.getState()
  const validationErrors = validateLoginForm(formData)

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors)
    return
  }

  const { clientId, clientSecret } = formData

  try {
    setLoading(true) // Start loading
    const resp = await LOCAL_AXIOS_INSTANCE.post('/login', { clientId, clientSecret })

    if (resp.status === 200) {
      const { organization_id, organization_name } = resp.data


      localStorage.setItem('cd_id', clientId)
      localStorage.setItem('cd_secret', clientSecret)
      localStorage.setItem('organization_id', organization_id)
      localStorage.setItem('organization_name', organization_name)
      setOrganizationName(organization_name)
      navigate(`/${organization_name}/projects`, { replace: true }) // Navigate to projects page
      setIsLoggedIn(true)


      sendMessage({
        type: 'authenticate',
        cd_id: clientId,
        cd_secret: clientSecret,
        organization_id: organization_id
      })
    }
  } catch (error: any) {
    console.error('[Error] ==>>', error)
    localStorage.clear()

    // Display appropriate error messages
    if (error.response?.status === 401) {
      toast({ title: 'Unauthorized', description: 'Invalid client ID or secret.' })
    } else if (error.response?.status === 400) {
      toast({
        title: 'Client error',
        description: 'Credentials already exist. Select an organization from the list.'
      })
    } else {
      toast({ title: 'Error', description: error.message || 'Unknown error occurred.' })
    }
  } finally {
    setLoading(false) // End loading
  }
}
