import { useEffect, useMemo, useState } from 'react';
import { Container, Section } from '@/components/common';
import { ProjectGrid } from '@/components/projects/ProjectGrid';
import { useProjects } from '@/hooks/useProjects';
import { SpinnerIcon } from '@/lib/icons';
import { cn } from '@/lib/cn';
import * as categoryService from '@/services/categoryService';

export function PortfolioPage() {
  const { projects, loading } = useProjects();
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => {});
  }, []);

  const visible = useMemo(() => {
    if (!categoryId) return projects;
    return projects.filter((project) => project.categoryId === categoryId);
  }, [projects, categoryId]);

  return (
    <main>
      <Section id="portfolio">
        <Container>
          <div className="text-center">
            <h1 className="text-section font-light leading-[1.04] tracking-[-0.035em] text-foreground">
              <span className="fx-shimmer-text motion-safe:animate-text-shimmer">Our works</span>
            </h1>
            <p className="mx-auto mt-5 max-w-[32rem] text-body leading-[1.8] text-muted-foreground">
              Every project below is managed from the admin portal — updates appear here
              automatically.
            </p>
          </div>

          {categories.length > 0 ? (
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              <FilterChip active={!categoryId} onClick={() => setCategoryId('')}>
                All
              </FilterChip>
              {categories.map((category) => (
                <FilterChip
                  key={category.id}
                  active={categoryId === category.id}
                  onClick={() => setCategoryId(category.id)}
                >
                  {category.name}
                </FilterChip>
              ))}
            </div>
          ) : null}

          <div className="mt-16 lg:mt-20">
            {loading ? (
              <div className="flex justify-center py-16" role="status" aria-label="Loading projects">
                <SpinnerIcon className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : visible.length === 0 ? (
              <p className="text-center text-muted-foreground">No projects yet.</p>
            ) : (
              <ProjectGrid projects={visible} />
            )}
          </div>
        </Container>
      </Section>
    </main>
  );
}

/**
 * @param {{ active: boolean; onClick: () => void; children: import('react').ReactNode }} props
 */
function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'relative rounded-sm px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.12em]',
        'transition-[color,background-color,box-shadow,border-color] duration-300',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        active
          ? 'bg-brand-navy text-white shadow-[0_0_22px_rgb(255_194_14_/_0.38)]'
          : 'fx-nav-link border border-border-subtle text-muted-foreground hover:border-border-interactive hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}
