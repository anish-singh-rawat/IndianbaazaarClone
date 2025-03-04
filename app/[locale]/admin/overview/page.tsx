import { Metadata } from 'next'

import OverviewReport from './overview-report'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
export const metadata: Metadata = {
  title: 'Admin Dashboard',
}
const DashboardPage = async () => {
  const session = await auth()
  if (session?.user.role !== 'Admin') redirect('/');
  return <OverviewReport />
}

export default DashboardPage
