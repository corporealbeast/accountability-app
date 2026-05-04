import { google } from 'googleapis'
import { getAuthenticatedClient } from './google-auth'

export interface SpreadsheetMeta {
  id: string
  name: string
  url: string
}

export async function listSpreadsheets(query?: string): Promise<SpreadsheetMeta[]> {
  const auth = await getAuthenticatedClient()
  const drive = google.drive({ version: 'v3', auth })

  const q = query
    ? `mimeType='application/vnd.google-apps.spreadsheet' and name contains '${query.replace(/'/g, "\\'")}'`
    : `mimeType='application/vnd.google-apps.spreadsheet'`

  const { data } = await drive.files.list({
    q,
    fields: 'files(id, name, webViewLink)',
    orderBy: 'modifiedTime desc',
    pageSize: 20,
  })

  return (data.files ?? []).map((f) => ({
    id: f.id ?? '',
    name: f.name ?? '',
    url: f.webViewLink ?? '',
  }))
}

export async function getSheetValues(spreadsheetId: string, range: string): Promise<string[][]> {
  const auth = await getAuthenticatedClient()
  const sheets = google.sheets({ version: 'v4', auth })

  const { data } = await sheets.spreadsheets.values.get({ spreadsheetId, range })
  return (data.values ?? []) as string[][]
}

export async function appendSheetValues(
  spreadsheetId: string,
  range: string,
  values: string[][]
): Promise<number> {
  const auth = await getAuthenticatedClient()
  const sheets = google.sheets({ version: 'v4', auth })

  const { data } = await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  })

  return data.updates?.updatedRows ?? 0
}

export async function updateSheetValues(
  spreadsheetId: string,
  range: string,
  values: string[][]
): Promise<number> {
  const auth = await getAuthenticatedClient()
  const sheets = google.sheets({ version: 'v4', auth })

  const { data } = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  })

  return data.updatedCells ?? 0
}
