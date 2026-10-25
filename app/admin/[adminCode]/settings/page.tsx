import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminSettings } from '@/components/admin/admin-settings'

export default async function AdminSettingsPage({ params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  return (
    <AdminLayout adminCode={adminCode}>
      <AdminSettings adminCode={adminCode} />
    </AdminLayout>
  )
}
