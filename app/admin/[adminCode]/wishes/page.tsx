import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminWishes } from '@/components/admin/admin-wishes'

export default async function AdminWishesPage({ params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  return (
    <AdminLayout adminCode={adminCode}>
      <AdminWishes adminCode={adminCode} />
    </AdminLayout>
  )
}
