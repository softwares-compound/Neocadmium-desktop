// src/server/controllers/get-clients.ts

import { Request, Response } from 'express'
import { ProjectModel } from '../models/projectModel'
import path from 'path'
import fs from 'fs'

// Controller to handle fetching clients
const handleCreateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { project_name, project_description, project_id, organization_id } = req.body
    if (!project_name || !project_id || !organization_id) {
      res.status(400).json({ error: 'project_name, project_id and organization_id are required.' })
      return
    }
    const project = ProjectModel.createProject(
      project_name,
      project_description ?? null,
      project_id,
      organization_id
    )

    if (!project) {
      res.status(500).json({ error: 'Failed to create project.' })
      return
    }

    const PROJECT_PATH = path.resolve(__dirname, `../../../target-codebases/${project_id}`)
    if (!fs.existsSync(PROJECT_PATH)) {
      fs.mkdirSync(PROJECT_PATH, { recursive: true })
    }

    res.status(200).json({
      name: project_name,
      description: project_description,
      project_id: project_id,
      organization_id: organization_id,
      is_connected_to_remote: false,
      remote_url: ''
    })
  } catch (error: any) {
    console.error('[Error] =====>>', error)

    // Handle database errors
    res.status(500).json({
      error: error.message || 'Failed to create project.',
      details: error || 'An unexpected error occurred.'
    })
  }
}

export default handleCreateProject
