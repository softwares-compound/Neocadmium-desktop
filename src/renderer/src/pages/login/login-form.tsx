import React from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import CustomLink from '../../components/ui/link'
import { useLoginStore } from '../../stores/useLoginStore'
import { handleLogin } from '../../services/api/handle-login'
import { useNavigate } from 'react-router-dom'

export function LoginForm() {
  const { formData, errors, loading, setFormData, clearErrors } = useLoginStore()
  const navigate = useNavigate()
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    await handleLogin(navigate) // Call the extracted login handler
  }

  return (
    <Card className="mx-auto max-w-sm w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Enter your client ID and client secret below to login.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="client-id">Client ID</Label>
            <Input
              id="client-id"
              type="password"
              placeholder="5c133a93-8dd4-4958-847a-ae81a5e11743"
              value={formData.clientId}
              onChange={(e) => {
                setFormData('clientId', e.target.value)
                clearErrors('clientId')
              }}
            />
            {errors.clientId && <span className="text-sm text-red-500">{errors.clientId}</span>}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="client-secret">Client Secret</Label>
              <CustomLink to="/forget-password" className="ml-auto inline-block text-sm underline">
                Lost your credentials?
              </CustomLink>
            </div>
            <Input
              id="client-secret"
              type="password"
              placeholder="2fb5be09-8dba-481c-aaaf-5efad1d0a59c"
              value={formData.clientSecret}
              onChange={(e) => {
                setFormData('clientSecret', e.target.value)
                clearErrors('clientSecret')
              }}
            />
            {errors.clientSecret && (
              <span className="text-sm text-red-500">{errors.clientSecret}</span>
            )}
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <CustomLink to="/tenant-name/projects" className="underline">
            Create an account
          </CustomLink>
        </div>
      </CardContent>
    </Card>
  )
}
