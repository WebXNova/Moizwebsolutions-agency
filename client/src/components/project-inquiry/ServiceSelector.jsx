import { inquiryServices } from '@/data/projectInquiry';
import { ServiceCard } from '@/components/project-inquiry/ServiceCard';

/**
 * @param {{ selected: string[]; onToggle: (id: string) => void; error?: string }} props
 */
export function ServiceSelector({ selected, onToggle, error }) {
  return (
    <div>
      {error ? (
        <p role="alert" className="mb-4 text-[0.75rem] text-danger">
          {error}
        </p>
      ) : null}

      <ul className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {inquiryServices.map((service, index) => (
          <li key={service.id} className="flex">
            <ServiceCard
              service={service}
              index={index}
              selected={selected.includes(service.id)}
              onToggle={() => onToggle(service.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
