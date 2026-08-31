/**
 * @typedef {Object} NavLink
 * @property {string} label
 * @property {string} href
 * @property {boolean} [external]
 */

/**
 * @typedef {Object} SocialLink
 * @property {string} platform
 * @property {string} href
 * @property {string} [label]
 */

/**
 * @typedef {Object} Service
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} [number]
 * @property {string} [icon]
 */

/**
 * @typedef {Object} Technology
 * @property {string} id
 * @property {string} name
 * @property {string} [category]
 * @property {string} [logo]
 * @property {string} [color]
 * @property {boolean} [invertOnDark]
 * @property {number} [width]
 * @property {number} [height]
 * @property {string} [icon]
 */

/**
 * @typedef {Object} ServiceGroup
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} icon
 * @property {string} [label]
 * @property {string[]} details
 */

/**
 * @typedef {Object} PortfolioProject
 * @property {string} id
 * @property {string} title
 * @property {string} slug
 * @property {string} categoryId
 * @property {string} category
 * @property {string} description
 * @property {string} technologies
 * @property {string} imageUrl
 * @property {string} liveUrl
 * @property {boolean} featured
 * @property {boolean} [published]
 * @property {number} displayOrder
 * @property {string} [client]
 * @property {number|string} [year]
 * @property {string} [githubUrl]
 * @property {string} [seoTitle]
 * @property {string} [seoDescription]
 * @property {string} [previewObjectPosition]
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 * @property {string} [previewPosition]
 * @property {number} [previewScale]
 */

/**
 * Client-only crop settings merged onto a project before render.
 * @typedef {Object} ProjectPreviewSettings
 * @property {string} src
 * @property {string} alt
 * @property {number} [width]
 * @property {number} [height]
 * @property {'website' | 'cover'} [mode]
 * @property {string} [objectPosition]
 * @property {string} [objectPositionMd]
 * @property {string} [objectPositionLg]
 * @property {number} [scale]
 * @property {string} [shiftY]
 * @property {number} [parallax]
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} [href]
 * @property {string} [image]
 * @property {string[]} [tags]
 * @property {string} [year]
 * @property {string} [category]
 * @property {boolean} [featured]
 */

/**
 * @typedef {Object} Testimonial
 * @property {string} id
 * @property {string} quote
 * @property {string} author
 * @property {string} [role]
 * @property {string} [company]
 * @property {string} [avatar]
 */

/**
 * @typedef {Object} ProcessStep
 * @property {string} id
 * @property {number} step
 * @property {string} title
 * @property {string} description
 * @property {string} [number]
 * @property {string} [icon]
 */

/**
 * @typedef {Object} TrustedCompany
 * @property {string} id
 * @property {string} name
 * @property {string} [logo]
 * @property {number} [width]
 * @property {number} [height]
 */

export {};
