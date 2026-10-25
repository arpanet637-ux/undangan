import { NewProjectForm } from '@/components/super-admin/new-project-form'

export const metadata = {
  title: 'Buat Project Baru - Template B',
}

export default function NewTemplateBProjectPage() {
  return (
    <NewProjectForm
      templateId="template-b"
      templateName="Template B (Dark Mode)"
      templateColor="bg-blue-500 text-white hover:bg-blue-600"
    />
  )
}
