import { NewProjectForm } from '@/components/super-admin/new-project-form'

export const metadata = {
  title: 'Buat Project Baru - Template A',
}

export default function NewTemplateAProjectPage() {
  return (
    <NewProjectForm
      templateId="template-a"
      templateName="Template A (Light Mode)"
      templateColor="bg-amber-500 text-white hover:bg-amber-600"
    />
  )
}
