import { Organization } from '../../types/types'
import { openDB } from '../config/sqlite'

export const OrganizationModel = {
  createOrganization: (
    organization_id: string,
    cd_id: string,
    cd_secret: string,
    organization_name: string
  ) => {
    const db = openDB()

    // ✅ Check if the organization already exists before inserting
    const existingOrg = db
      .prepare(`SELECT * FROM organization_detail WHERE id = ?`)
      .get(organization_id)

    if (existingOrg) {
      console.log(`Organization ${organization_id} already exists. Skipping insert.`)
      return existingOrg
    }

    const stmt = db.prepare(`
            INSERT INTO organization_detail (id, cd_id, cd_secret, organization_name)
            VALUES (?, ?, ?, ?)
        `)
    stmt.run(organization_id, cd_id, cd_secret, organization_name)

    return db.prepare(`SELECT * FROM organization_detail WHERE id = ?`).get(organization_id)
  },

  getOrganizationById: (id: string) => {
    const db = openDB()
    const stmt = db.prepare(`
            SELECT * FROM organization_detail WHERE organization_id = ?
        `)
    return stmt.get(id) as Organization
  },

  getOrganizationByCdIdAndCdSecret: (cd_id: string, cd_secret: string) => {
    const db = openDB()
    const stmt = db.prepare(`
            SELECT * FROM organization_detail WHERE cd_id = ? AND cd_secret = ?
        `)
    return stmt.get(cd_id, cd_secret) as Organization
  },

  getAllOrganizations: () => {
    const db = openDB()
    const stmt = db.prepare(`
            SELECT * FROM organization_detail
        `)
    return stmt.all() as Organization[]
  },

  deleteOrganization: (id: string) => {
    const db = openDB()
    const stmt = db.prepare(`
            DELETE FROM organization_detail WHERE organization_id = ?
        `)
    return stmt.run(id)
  }
}
