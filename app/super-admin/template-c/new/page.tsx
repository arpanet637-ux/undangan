import { NewProjectForm } from '@/components/super-admin/new-project-form'

export const metadata = {
  title: 'Buat Project Baru - Template C',
}

export default function NewTemplateCProjectPage() {
  return (
    <NewProjectForm
      templateId="template-c"
      templateName="Template C (Metatah Light)"
      templateColor="bg-emerald-500 text-white hover:bg-emerald-600"
    />
  )
}
