import { useNavigate } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProjectForm } from '@/components/admin/ProjectForm';
import * as projectService from '@/services/projectService';

export function AddProject() {
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    await projectService.createProject(data);
    navigate('/admin/projects');
  };

  return (
    <>
      <AdminHeader title="Add Project" breadcrumb="Admin / Projects" />
      <div className="p-4 sm:p-6 lg:p-8">
        <ProjectForm onSubmit={handleSubmit} submitLabel="Create Project" />
      </div>
    </>
  );
}
