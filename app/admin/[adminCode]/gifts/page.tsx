import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminGifts } from '@/components/admin/admin-gifts'

export default async function AdminGiftsPage({ params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  return (
    <AdminLayout adminCode={adminCode}>
      <AdminGifts adminCode={adminCode} />
    </AdminLayout>
  )
}
