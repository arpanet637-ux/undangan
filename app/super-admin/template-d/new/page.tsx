import { NewProjectForm } from '@/components/super-admin/new-project-form'

export const metadata = {
  title: 'Buat Project Baru - Template D',
}

export default function NewTemplateDProjectPage() {
  return (
    <NewProjectForm
      templateId="template-d"
      templateName="Template D (Metatah Dark)"
      templateColor="bg-violet-500 text-white hover:bg-violet-600"
    />
  )
}
