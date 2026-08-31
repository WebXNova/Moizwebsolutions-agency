import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProjectForm } from '@/components/admin/ProjectForm';
import * as projectService from '@/services/projectService';
import { SpinnerIcon } from '@/lib/icons';

export function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    projectService
      .getProject(id)
      .then((project) =>
        setInitial({
          title: project.title,
          slug: project.slug,
          categoryId: project.categoryId,
          description: project.description,
          technologies: project.technologies,
          liveUrl: project.liveUrl,
          imageUrl: project.imageUrl,
          featured: Boolean(project.featured),
          published: Boolean(project.published),
          displayOrder: project.displayOrder ?? 0,
          client: project.client ?? '',
          year: project.year ?? '',
          githubUrl: project.githubUrl ?? '',
          seoTitle: project.seoTitle ?? '',
          seoDescription: project.seoDescription ?? '',
          previewObjectPosition: project.previewObjectPosition ?? 'center',
        }),
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (data) => {
    await projectService.updateProject(id, data);
    navigate('/admin/projects');
  };

  return (
    <>
      <AdminHeader title="Edit Project" breadcrumb="Admin / Projects" />
      <div className="p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <SpinnerIcon className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <ProjectForm initialValues={initial} onSubmit={handleSubmit} submitLabel="Update Project" />
        )}
      </div>
    </>
  );
}
