/**
 * Products API Module
 * Simulates a database-backed product listing endpoint with
 * pagination support. Replace `fetchProducts` with a real
 * fetch() call when a backend is available.
 */

/** @type {Array<ProductRecord>} */
const PRODUCTS_DB = [
    {
        id: 'prod-001',
        title: 'Soft Linen Throw',
        category: 'Textiles',
        tag: 'New',
        price: 48,
        status: 'In stock',
        description: 'Lightweight texture for sofas, guest rooms, and reading corners.',
        search: 'linen throw textiles neutral living room'
    },
    {
        id: 'prod-002',
        title: 'Matte Ceramic Mug',
        category: 'Kitchen',
        tag: 'Bestseller',
        price: 22,
        status: 'Low stock',
        description: 'A clean silhouette with a soft finish for coffee, tea, or display.',
        search: 'ceramic mug kitchen tableware matte sand'
    },
    {
        id: 'prod-003',
        title: 'Oak Utility Tray',
        category: 'Decor',
        tag: 'Handmade',
        price: 36,
        status: 'In stock',
        description: 'Designed for entryways, bedside tables, and serving small essentials.',
        search: 'oak tray wood decor serving organizer'
    },
    {
        id: 'prod-004',
        title: 'Linear Desk Lamp',
        category: 'Lighting',
        tag: 'Studio pick',
        price: 74,
        status: 'In stock',
        description: 'Focused light and a compact footprint for calm, efficient workspaces.',
        search: 'desk lamp lighting workspace minimalist'
    },
    {
        id: 'prod-005',
        title: 'Woven Storage Basket',
        category: 'Storage',
        tag: 'Popular',
        price: 31,
        status: 'In stock',
        description: 'A tidy solution for shelves, laundry corners, and everyday organization.',
        search: 'storage basket woven natural organization'
    },
    {
        id: 'prod-006',
        title: 'Threadbound Journal',
        category: 'Stationery',
        tag: 'Giftable',
        price: 18,
        status: 'In stock',
        description: 'Minimal pages and durable binding for planning, sketching, and notes.',
        search: 'journal notebook paper stationery gift'
    },
    {
        id: 'prod-007',
        title: 'Marble Soap Dish',
        category: 'Bathroom',
        tag: 'New',
        price: 27,
        status: 'In stock',
        description: 'Cool stone surface keeps bars dry between uses and elevates any sink.',
        search: 'marble soap dish bathroom stone minimal'
    },
    {
        id: 'prod-008',
        title: 'Pinch Linen Pillowcase',
        category: 'Textiles',
        tag: 'Bestseller',
        price: 34,
        status: 'In stock',
        description: 'Pre-washed natural linen for a relaxed, lived-in look on any bed.',
        search: 'linen pillowcase textiles bedding natural sleep'
    },
    {
        id: 'prod-009',
        title: 'Slim Wall Clock',
        category: 'Decor',
        tag: 'Studio pick',
        price: 55,
        status: 'In stock',
        description: 'Quiet sweep movement and a minimal face that suits any wall colour.',
        search: 'wall clock decor time minimalist quiet'
    },
    {
        id: 'prod-010',
        title: 'Recycled Glass Vase',
        category: 'Decor',
        tag: 'Handmade',
        price: 42,
        status: 'Low stock',
        description: 'Mouth-blown with subtle bubbles that catch light on a windowsill.',
        search: 'glass vase decor flowers recycled handmade'
    },
    {
        id: 'prod-011',
        title: 'Bamboo Cutting Board',
        category: 'Kitchen',
        tag: 'Popular',
        price: 29,
        status: 'In stock',
        description: 'Durable grain, easy on knife edges, and gentle enough for daily prep.',
        search: 'bamboo cutting board kitchen wood prep'
    },
    {
        id: 'prod-012',
        title: 'Beeswax Taper Candles',
        category: 'Lighting',
        tag: 'Giftable',
        price: 16,
        status: 'In stock',
        description: 'Long-burning natural wax with a clean honey scent and ivory finish.',
        search: 'candle beeswax taper lighting natural scent gift'
    }
];

/**
 * @typedef {Object} ProductRecord
 * @property {string} id
 * @property {string} title
 * @property {string} category
 * @property {string} tag
 * @property {number} price
 * @property {string} status
 * @property {string} description
 * @property {string} search
 */

/**
 * @typedef {Object} ProductPage
 * @property {ProductRecord[]} items      - Products for the current page
 * @property {number}          total      - Total number of matching products
 * @property {number}          page       - Current page (1-based)
 * @property {number}          pageSize   - Items per page
 * @property {boolean}         hasMore    - Whether further pages exist
 */

/**
 * Simulated async product fetch — mirrors the shape a real REST/GraphQL
 * endpoint would return so swapping it out requires no other changes.
 *
 * @param {Object}  [opts]
 * @param {number}  [opts.page=1]       - Page number (1-based)
 * @param {number}  [opts.pageSize=6]   - Results per page
 * @param {string}  [opts.query='']     - Free-text search query
 * @returns {Promise<ProductPage>}
 */
export async function fetchProducts({ page = 1, pageSize = 6, query = '' } = {}) {
    // Simulate network latency (remove / reduce for production).
    await new Promise(resolve => setTimeout(resolve, 320));

    const normalised = query.trim().toLowerCase();

    const filtered = normalised
        ? PRODUCTS_DB.filter(p => {
            const haystack = `${p.search} ${p.title} ${p.category}`.toLowerCase();
            return haystack.includes(normalised);
        })
        : PRODUCTS_DB;

    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const items = filtered.slice(startIndex, startIndex + pageSize);
    const hasMore = startIndex + pageSize < total;

    return { items, total, page, pageSize, hasMore };
}
