import { Container } from '@/components/common/Container';
import { Section } from '@/components/common/Section';
import { legalPages } from '@/data/legal';
import { Navigate } from 'react-router-dom';

/**
 * @param {{ slug: 'privacy' | 'terms' | 'refund' }} props
 */
export function LegalPage({ slug }) {
  const page = legalPages[slug];

  if (!page) return <Navigate to="/" replace />;

  return (
    <main>
      <Section>
        <Container narrow>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Legal</p>
          <h1 className="mt-4 text-section font-light tracking-[-0.03em] text-foreground">
            {page.title}
          </h1>
          <p className="mt-3 text-[0.8125rem] text-muted-foreground">Last updated {page.updated}</p>

          <div className="mt-12 space-y-10">
            {page.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-subheading font-normal text-foreground">{section.heading}</h2>
                <p className="mt-3 text-body leading-[1.85] text-muted-foreground">{section.body}</p>
              </section>
            ))}
          </div>
        </Container>
      </Section>
    </main>
  );
}
