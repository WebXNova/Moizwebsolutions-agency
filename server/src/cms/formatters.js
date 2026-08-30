/**
 * @param {Record<string, unknown>} row
 */
export function formatService(row) {
  let details = [];
  try {
    details = JSON.parse(row.details_json || '[]');
  } catch {
    details = [];
  }
  return {
    id: row.id,
    slug: row.slug,
    icon: row.icon,
    label: row.label,
    title: row.title,
    description: row.description,
    details,
    ctaText: row.cta_text,
    ctaUrl: row.cta_url,
    categoryLabel: row.category_label,
    active: Boolean(row.active),
    featured: Boolean(row.featured),
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * @param {Record<string, unknown>} row
 */
export function formatTestimonial(row) {
  return {
    id: row.id,
    quote: row.quote,
    author: row.author,
    role: row.role,
    company: row.company,
    avatarUrl: row.avatar_url,
    verified: Boolean(row.verified),
    featured: Boolean(row.featured),
    published: Boolean(row.published),
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * @param {Record<string, unknown>} row
 */
export function formatTrustedCompany(row) {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url,
    websiteUrl: row.website_url,
    logoAlt: row.logo_alt,
    active: Boolean(row.active),
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * @param {Record<string, unknown>} row
 */
export function formatTechnology(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    logoUrl: row.logo_url,
    color: row.color,
    invertOnDark: Boolean(row.invert_on_dark),
    active: Boolean(row.active),
    featured: Boolean(row.featured),
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * @param {Record<string, unknown>} row
 */
export function formatProcessStep(row) {
  return {
    id: row.id,
    stepNumber: row.step_number,
    title: row.title,
    description: row.description,
    icon: row.icon,
    active: Boolean(row.active),
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * @param {Record<string, unknown>} row
 */
export function formatWebsiteUpdate(row) {
  return {
    id: row.id,
    title: row.title,
    shortDescription: row.short_description,
    fullDescription: row.full_description,
    imageUrl: row.image_url,
    category: row.category,
    ctaText: row.cta_text,
    ctaUrl: row.cta_url,
    published: Boolean(row.published),
    featured: Boolean(row.featured),
    startDate: row.start_date,
    endDate: row.end_date,
    displayOrder: row.display_order,
    status: getUpdateStatus(row),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * @param {Record<string, unknown>} row
 */
export function getUpdateStatus(row) {
  const now = new Date().toISOString();
  if (!row.published) return 'draft';
  if (row.end_date && row.end_date < now) return 'expired';
  if (row.start_date && row.start_date > now) return 'scheduled';
  return 'published';
}

/**
 * @param {Record<string, unknown>} row
 */
export function formatSocialLink(row) {
  return {
    id: row.id,
    platform: row.platform,
    href: row.href,
    label: row.label,
    icon: row.icon,
    active: Boolean(row.active),
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * @param {Record<string, unknown>} row
 */
export function formatNavigationItem(row) {
  return {
    id: row.id,
    label: row.label,
    href: row.href,
    active: Boolean(row.active),
    isSystem: Boolean(row.is_system),
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * @param {Record<string, unknown>} row
 */
export function formatMedia(row) {
  return {
    id: row.id,
    filename: row.filename,
    url: row.url,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    altText: row.alt_text,
    createdAt: row.created_at,
  };
}

/**
 * @param {Record<string, unknown>} row
 */
export function formatActivityLog(row) {
  return {
    id: row.id,
    adminId: row.admin_id,
    adminEmail: row.admin_email,
    action: row.action,
    resourceType: row.resource_type,
    resourceId: row.resource_id,
    details: row.details,
    ip: row.ip,
    success: Boolean(row.success),
    createdAt: row.created_at,
  };
}

/**
 * @param {string | null | undefined} nowIso
 */
export function isUpdatePubliclyVisible(row, nowIso = new Date().toISOString()) {
  if (!row.published) return false;
  if (row.start_date && row.start_date > nowIso) return false;
  if (row.end_date && row.end_date < nowIso) return false;
  return true;
}
