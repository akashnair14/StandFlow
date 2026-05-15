import { getMyReportsAction } from '@/lib/actions/reports'
import { getUserActiveTeam } from '@/lib/actions/teams'
import { MyReportsClient } from './my-reports-client'
import { Report } from '@/types'

export const metadata = {
  title: 'My Reports | StandFlow',
  description: 'View your daily progress and metrics.',
}

export default async function MyReportsPage() {
  // Fetch data on the server
  const [reportsResult, teamResult] = await Promise.all([
    getMyReportsAction(),
    getUserActiveTeam()
  ])

  const initialReports: Report[] = reportsResult.reports || []
  const teamId = teamResult.teamId || ''

  return (
    <MyReportsClient 
      initialReports={initialReports} 
      teamId={teamId} 
    />
  )
}
