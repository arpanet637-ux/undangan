import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminEvents } from '@/components/admin/admin-events'

export default async function AdminEventsPage({ params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  return (
    <AdminLayout adminCode={adminCode}>
      <AdminEvents adminCode={adminCode} />
    </AdminLayout>
  )
}
