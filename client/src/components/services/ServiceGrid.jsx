import { useState } from 'react';
import { ServiceCard } from '@/components/services/ServiceCard';

/**
 * Responsive service grid — 1 / 2 / 4 columns. Data-driven; no duplicated markup.
 *
 * @param {{
 *   services?: import('@/types').ServiceGroup[];
 *   revealed?: boolean;
 * }} props
 */
export function ServiceGrid({ services = [], revealed = true }) {
  const [activeId, setActiveId] = useState(null);

  return (
    <ul className="group/services mt-10 grid grid-cols-1 items-start sm:mt-16 md:mt-24 md:grid-cols-2 md:gap-0 lg:grid-cols-4">
      {services.map((service, index) => (
        <ServiceCard
          key={service.id}
          service={service}
          index={index}
          revealed={revealed}
          active={activeId === service.id}
          onToggle={() =>
            setActiveId((current) => (current === service.id ? null : service.id))
          }
        />
      ))}
    </ul>
  );
}
