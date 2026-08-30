import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatsCard } from '@/components/admin/StatsCard';
import * as authService from '@/services/authService';
import { SpinnerIcon } from '@/lib/icons';

const quickActions = [
  { label: 'Add Project', to: '/admin/projects/new' },
  { label: 'Add Testimonial', to: '/admin/testimonials' },
  { label: 'Add Company', to: '/admin/trusted-companies' },
  { label: 'Add Service', to: '/admin/services' },
  { label: 'Add Technology', to: '/admin/technologies' },
  { label: 'New Update', to: '/admin/updates' },
  { label: 'Upload Media', to: '/admin/media' },
  { label: 'Edit Homepage', to: '/admin/hero' },
];

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    authService
      .getDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AdminHeader title="Dashboard" breadcrumb="Admin" />
      <div className="space-y-8 p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <SpinnerIcon className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatsCard label="Total Projects" value={data.stats.totalProjects} />
              <StatsCard label="Featured Projects" value={data.stats.featuredProjects} />
              <StatsCard label="Services" value={data.stats.totalServices} />
              <StatsCard label="Testimonials" value={data.stats.totalTestimonials} />
              <StatsCard label="Trusted Companies" value={data.stats.totalCompanies} />
              <StatsCard label="Technologies" value={data.stats.totalTechnologies} />
              <StatsCard label="Published Updates" value={data.stats.publishedUpdates} />
              <StatsCard label="Draft Updates" value={data.stats.draftUpdates} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-border-subtle bg-surface p-5">
                <h2 className="text-[14px] font-medium text-foreground">Website Health</h2>
                <ul className="mt-4 space-y-2 text-[13px] text-muted-foreground">
                  {data.health.missingLiveUrls > 0 ? (
                    <li>{data.health.missingLiveUrls} project(s) missing Live Preview URLs.</li>
                  ) : (
                    <li className="text-foreground">All projects have Live Preview URLs.</li>
                  )}
                  {data.health.missingImages > 0 ? (
                    <li>{data.health.missingImages} project(s) missing images.</li>
                  ) : null}
                  {data.health.missingAvatars > 0 ? (
                    <li>{data.health.missingAvatars} testimonial(s) have no avatar.</li>
                  ) : null}
                  {data.health.missingSeoTitle ? (
                    <li>Homepage SEO title is empty.</li>
                  ) : null}
                  {data.health.missingSeoDescription ? (
                    <li>Homepage SEO description is empty.</li>
                  ) : null}
                </ul>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface p-5">
                <h2 className="text-[14px] font-medium text-foreground">Quick Actions</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <Link
                      key={action.to}
                      to={action.to}
                      className="rounded-lg border border-border-subtle px-3 py-2 text-[12px] font-medium text-foreground hover:bg-surface-muted"
                    >
                      {action.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h2 className="text-[14px] font-medium text-foreground">Recent Projects</h2>
                <ul className="mt-4 divide-y divide-border-subtle rounded-xl border border-border-subtle bg-surface">
                  {data.recentProjects.length === 0 ? (
                    <li className="px-4 py-6 text-[13px] text-muted-foreground">No projects yet.</li>
                  ) : (
                    data.recentProjects.map((project) => (
                      <li key={project.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-[14px] font-medium text-foreground">{project.title}</p>
                          <p className="text-[12px] text-muted-foreground">
                            {project.category}
                            {project.featured ? ' · Featured' : ''}
                            {!project.published ? ' · Draft' : ''}
                          </p>
                        </div>
                        <Link
                          to={`/admin/projects/${project.id}/edit`}
                          className="text-[12px] text-muted-foreground hover:text-foreground"
                        >
                          Edit
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              <div>
                <h2 className="text-[14px] font-medium text-foreground">Recent Activity</h2>
                <ul className="mt-4 divide-y divide-border-subtle rounded-xl border border-border-subtle bg-surface">
                  {data.recentActivity?.length === 0 ? (
                    <li className="px-4 py-6 text-[13px] text-muted-foreground">No activity yet.</li>
                  ) : (
                    data.recentActivity?.map((log) => (
                      <li key={log.id} className="px-4 py-3">
                        <p className="text-[13px] text-foreground">
                          {log.adminEmail || 'Admin'} — {log.action.replace(/_/g, ' ')}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{log.createdAt}</p>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
