import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default async function AdminPage({ params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  return (
    <AdminLayout adminCode={adminCode}>
      <AdminDashboard adminCode={adminCode} />
    </AdminLayout>
  )
}
