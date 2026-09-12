import {
  InquiryField,
  inquiryControlClass,
} from '@/components/project-inquiry/InquiryField';

/**
 * @param {{
 *   form: import('@/lib/buildProjectInquiryMessage').InquiryForm;
 *   errors: Record<string, string>;
 *   onFieldChange: (field: string, value: string) => void;
 * }} props
 */
export function ContactDetailsStep({ form, errors, onFieldChange }) {
  const fields = [
    {
      id: 'inquiry-name',
      name: 'name',
      label: 'Full name',
      placeholder: 'Your name',
      autoComplete: 'name',
      type: 'text',
    },
    {
      id: 'inquiry-business',
      name: 'business',
      label: 'Business / brand',
      placeholder: 'Company or brand name',
      autoComplete: 'organization',
      type: 'text',
      optional: true,
    },
    {
      id: 'inquiry-email',
      name: 'email',
      label: 'Email',
      placeholder: 'you@company.com',
      autoComplete: 'email',
      type: 'email',
    },
    {
      id: 'inquiry-phone',
      name: 'phone',
      label: 'WhatsApp / phone',
      placeholder: '+92 300 0000000',
      autoComplete: 'tel',
      type: 'tel',
      optional: true,
    },
  ];

  const optionalLinks = [
    {
      id: 'inquiry-website',
      name: 'website',
      label: 'Current website',
      placeholder: 'https://',
      type: 'url',
    },
    {
      id: 'inquiry-social',
      name: 'social',
      label: 'Social / profile link',
      placeholder: 'Instagram, LinkedIn, YouTube…',
      type: 'text',
    },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {fields.map((field, index) => (
          <InquiryField
            key={field.name}
            id={field.id}
            label={field.label}
            optional={field.optional}
            error={errors[field.name]}
            className="motion-safe:animate-fade-up motion-reduce:animate-none"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <input
              id={field.id}
              type={field.type}
              value={form[field.name]}
              autoComplete={field.autoComplete}
              aria-invalid={Boolean(errors[field.name])}
              aria-describedby={errors[field.name] ? `${field.id}-error` : undefined}
              onChange={(event) => onFieldChange(field.name, event.target.value)}
              placeholder={field.placeholder}
              className={inquiryControlClass(errors[field.name])}
            />
          </InquiryField>
        ))}
      </div>

      <div className="mt-9 border-t border-hairline pt-7">
        <p className="mb-5 text-[0.625rem] font-medium uppercase tracking-[0.16em] text-gray-700 dark:text-neutral-200">
          Helpful extras
        </p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {optionalLinks.map((field) => (
            <InquiryField key={field.name} id={field.id} label={field.label} optional>
              <input
                id={field.id}
                type={field.type}
                value={form[field.name]}
                onChange={(event) => onFieldChange(field.name, event.target.value)}
                placeholder={field.placeholder}
                className={inquiryControlClass()}
              />
            </InquiryField>
          ))}
        </div>
      </div>
    </div>
  );
}
