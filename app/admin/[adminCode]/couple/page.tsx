import { AdminLayout } from '@/components/admin/admin-layout'
import { AdminCouple } from '@/components/admin/admin-couple'

export default async function AdminCouplePage({ params }: { params: Promise<{ adminCode: string }> }) {
  const { adminCode } = await params
  return (
    <AdminLayout adminCode={adminCode}>
      <AdminCouple adminCode={adminCode} />
    </AdminLayout>
  )
}
