import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminGuests } from '@/components/admin/admin-guests'

export default async function AdminGuestsPage({ params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  return (
    <AdminLayout adminCode={adminCode}>
      <AdminGuests adminCode={adminCode} />
    </AdminLayout>
  )
}
