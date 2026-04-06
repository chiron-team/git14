/**
 * Product Listings Module
 * Fetches products from the API and renders them dynamically into the
 * products grid.  Supports:
 *   - Initial page load from the "database"
 *   - "Load more" pagination
 *   - Live search (integrates with the existing storeSearchForm)
 *   - Entrance animations via the shared data-animate / animate-in pattern
 *   - Full accessibility (aria-live regions, aria-busy, focus management)
 */

import { fetchProducts } from '../api/products.js';
import { debounce } from '../utils/helpers.js';

/** Number of products shown per page / per "load more" batch. */
const PAGE_SIZE = 6;

export class ProductListings {
    constructor() {
        // Core grid elements
        this.grid = document.getElementById('productGrid');
        this.emptyState = document.getElementById('productEmptyState');
        this.loadMoreBtn = document.getElementById('loadMoreProducts');
        this.loadMoreWrapper = document.getElementById('loadMoreWrapper');
        this.gridStatus = document.getElementById('gridStatus');
        this.loadingIndicator = document.getElementById('productLoadingIndicator');

        // Search elements (shared with main.js hero search)
        this.searchForm = document.getElementById('storeSearchForm');
        this.searchInput = document.getElementById('productSearch');
        this.searchStatus = document.getElementById('searchStatus');

        // State
        this._currentPage = 1;
        this._currentQuery = '';
        this._totalProducts = 0;
        this._isLoading = false;
        this._observer = null;

        this.init();
    }

    // ─── Lifecycle ────────────────────────────────────────────────────────────

    /**
     * Bootstrap the module: load the first page and attach listeners.
     */
    async init() {
        if (!this.grid) {
            console.warn('ProductListings: #productGrid not found.');
            return;
        }

        this._setupEventListeners();
        await this._loadPage({ reset: true });
    }

    // ─── Event wiring ─────────────────────────────────────────────────────────

    _setupEventListeners() {
        // "Load more" button
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('click', () => this._handleLoadMore());
        }

        // Keyboard: activate load-more with Enter / Space
        if (this.loadMoreBtn) {
            this.loadMoreBtn.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this._handleLoadMore();
                }
            });
        }

        // Live search – debounced so we don't fire on every keystroke
        if (this.searchInput) {
            const debouncedSearch = debounce(() => {
                this._handleSearch(this.searchInput.value);
            }, 250);

            this.searchInput.addEventListener('input', debouncedSearch);
        }

        // Search form submit
        if (this.searchForm) {
            this.searchForm.addEventListener('submit', e => {
                e.preventDefault();
                if (this.searchInput) {
                    this._handleSearch(this.searchInput.value);
                }
            });
        }
    }

    // ─── User actions ─────────────────────────────────────────────────────────

    async _handleLoadMore() {
        if (this._isLoading) { return; }
        await this._loadPage({ reset: false });
        this._focusFirstNewCard();
    }

    async _handleSearch(query) {
        if (query === this._currentQuery) { return; }
        this._currentQuery = query;
        this._currentPage = 1;
        await this._loadPage({ reset: true });
    }

    // ─── Data loading ─────────────────────────────────────────────────────────

    /**
     * Fetch a page of products and update the DOM.
     *
     * @param {Object}  opts
     * @param {boolean} opts.reset - When true the grid is cleared first
     *                               (new search or initial load).
     */
    async _loadPage({ reset }) {
        if (this._isLoading) { return; }

        this._isLoading = true;
        this._setLoadingState(true);

        try {
            const { items, total, hasMore } = await fetchProducts({
                page: this._currentPage,
                pageSize: PAGE_SIZE,
                query: this._currentQuery
            });

            this._totalProducts = total;

            if (reset) {
                this._clearGrid();
            }

            if (items.length > 0) {
                this._renderItems(items);
                this._currentPage += 1;
            }

            this._updateEmptyState(total === 0);
            this._updateLoadMore(hasMore);
            this._updateSearchStatus(total);
        } catch (err) {
            console.error('ProductListings: failed to load products', err);
            this._updateEmptyState(true, /* isError */ true);
        } finally {
            this._isLoading = false;
            this._setLoadingState(false);
        }
    }

    // ─── Rendering ────────────────────────────────────────────────────────────

    /**
     * Build and insert product card elements for an array of product records.
     * @param {import('../api/products.js').ProductRecord[]} items
     */
    _renderItems(items) {
        // Build a document fragment to avoid multiple reflows.
        const fragment = document.createDocumentFragment();

        items.forEach(product => {
            const card = this._buildCard(product);
            fragment.appendChild(card);
        });

        this.grid.appendChild(fragment);

        // Trigger entrance animations for the newly inserted cards.
        this._observeNewCards();
    }

    /**
     * Create a single product card element from a product record.
     * The markup mirrors the static cards that were previously in index.html.
     *
     * @param {import('../api/products.js').ProductRecord} product
     * @returns {HTMLElement}
     */
    _buildCard(product) {
        const article = document.createElement('article');
        article.className = 'product-card';
        article.dataset.id = product.id;
        article.dataset.animate = '';
        article.dataset.search = product.search;

        const statusClass
            = product.status === 'Low stock'
                ? 'product-card__status product-card__status--low'
                : 'product-card__status';

        article.innerHTML = `
            <div class="product-card__meta">
                <span class="product-card__tag">${this._escape(product.tag)}</span>
                <span class="product-card__category">${this._escape(product.category)}</span>
            </div>
            <h3 class="product-card__title">${this._escape(product.title)}</h3>
            <div class="placeholder-image placeholder-image--product" aria-hidden="true">
                <span class="placeholder-image__label">Product image</span>
            </div>
            <p class="product-card__description">${this._escape(product.description)}</p>
            <div class="product-card__footer">
                <span class="product-card__price">$${product.price}</span>
                <span class="${statusClass}">${this._escape(product.status)}</span>
            </div>
        `;

        return article;
    }

    // ─── DOM helpers ──────────────────────────────────────────────────────────

    /** Remove all rendered product cards from the grid. */
    _clearGrid() {
        this.grid.innerHTML = '';
        this._currentPage = 1;
    }

    /**
     * Show or hide the empty-state message.
     * @param {boolean} isEmpty
     * @param {boolean} [isError=false]
     */
    _updateEmptyState(isEmpty, isError = false) {
        if (!this.emptyState) { return; }

        if (isEmpty) {
            this.emptyState.hidden = false;
            this.emptyState.textContent = isError
                ? 'Unable to load products. Please refresh the page.'
                : this._currentQuery.trim()
                    ? `No products match "${this._currentQuery.trim()}". Try a broader term such as "decor" or "kitchen".`
                    : 'No products are available right now.';
        } else {
            this.emptyState.hidden = true;
        }
    }

    /**
     * Show or hide the "Load more" button.
     * @param {boolean} hasMore
     */
    _updateLoadMore(hasMore) {
        if (!this.loadMoreWrapper) { return; }
        this.loadMoreWrapper.hidden = !hasMore;

        if (this.loadMoreBtn) {
            this.loadMoreBtn.disabled = !hasMore;
        }
    }

    /**
     * Update the accessible search-status / product count text.
     * @param {number} total
     */
    _updateSearchStatus(total) {
        if (!this.searchStatus) { return; }

        const query = this._currentQuery.trim();
        if (query === '') {
            this.searchStatus.textContent = `Showing ${total} curated product${total === 1 ? '' : 's'}.`;
        } else if (total > 0) {
            this.searchStatus.textContent = `Found ${total} product${total === 1 ? '' : 's'} for "${query}".`;
        } else {
            this.searchStatus.textContent = `No products found for "${query}".`;
        }
    }

    /**
     * Toggle aria-busy on the grid and show/hide the inline loading indicator.
     * @param {boolean} isLoading
     */
    _setLoadingState(isLoading) {
        if (this.grid) {
            this.grid.setAttribute('aria-busy', String(isLoading));
        }

        if (this.loadingIndicator) {
            this.loadingIndicator.hidden = !isLoading;
        }

        if (this.loadMoreBtn) {
            this.loadMoreBtn.disabled = isLoading;
            this.loadMoreBtn.classList.toggle('btn--loading', isLoading);
            this.loadMoreBtn.textContent = isLoading ? 'Loading…' : 'Load more products';
        }
    }

    /**
     * Move keyboard focus to the first card that was just added.
     * This improves accessibility after a "load more" action.
     */
    _focusFirstNewCard() {
        // The newly added cards start at index (currentPage - 2) * PAGE_SIZE
        // because _currentPage was already incremented after loading.
        const insertedFromIndex = (this._currentPage - 2) * PAGE_SIZE;
        const cards = this.grid.querySelectorAll('.product-card');
        const firstNew = cards[insertedFromIndex];

        if (firstNew) {
            firstNew.setAttribute('tabindex', '-1');
            firstNew.focus({ preventScroll: false });
            firstNew.addEventListener('blur', () => firstNew.removeAttribute('tabindex'), {
                once: true
            });
        }
    }

    // ─── Animations ───────────────────────────────────────────────────────────

    /**
     * Wire up IntersectionObserver for entrance animations on newly rendered
     * cards, consistent with the existing `data-animate` / `animate-in` pattern
     * used throughout the page.
     */
    _observeNewCards() {
        if (!window.IntersectionObserver) {
            // Fallback: immediately mark all cards as visible.
            this.grid.querySelectorAll('[data-animate]:not(.animate-in)').forEach(el => {
                el.classList.add('animate-in');
            });
            return;
        }

        // Reuse a single observer instance across calls.
        if (!this._observer) {
            this._observer = new IntersectionObserver(
                entries => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('animate-in');
                            this._observer.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
            );
        }

        // Observe only cards that haven't animated yet.
        this.grid.querySelectorAll('[data-animate]:not(.animate-in)').forEach(el => {
            this._observer.observe(el);
        });
    }

    // ─── Utilities ────────────────────────────────────────────────────────────

    /**
     * Escape a string for safe insertion as text content via innerHTML.
     * @param {string} str
     * @returns {string}
     */
    _escape(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // ─── Public API ───────────────────────────────────────────────────────────

    /**
     * Programmatically trigger a search (used by external callers if needed).
     * @param {string} query
     */
    search(query) {
        if (this.searchInput) {
            this.searchInput.value = query;
        }
        this._handleSearch(query);
    }

    /** Clean up observers and listeners. */
    destroy() {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
    }
}
