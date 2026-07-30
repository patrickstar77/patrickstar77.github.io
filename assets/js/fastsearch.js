import * as params from '@params';

const resList = document.getElementById('searchResults');
const sInput = document.getElementById('searchInput');
const searchBox = document.getElementById('searchbox');
const searchGuide = document.getElementById('searchGuide');
const searchStatus = document.getElementById('searchStatus');

let fuse;
let currentElement = null;
let firstResult = null;
let lastResult = null;

const defaultFuseOptions = {
    distance: 100,
    threshold: 0.4,
    ignoreLocation: true,
    keys: ['title', 'permalink', 'summary', 'content']
};

const buildFuseOptions = () => {
    if (!params.fuseOpts) {
        return { ...defaultFuseOptions, includeMatches: true };
    }

    return {
        isCaseSensitive: params.fuseOpts.iscasesensitive ?? false,
        includeScore: params.fuseOpts.includescore ?? false,
        includeMatches: true,
        minMatchCharLength: params.fuseOpts.minmatchcharlength ?? 1,
        shouldSort: params.fuseOpts.shouldsort ?? true,
        findAllMatches: params.fuseOpts.findallmatches ?? false,
        keys: params.fuseOpts.keys ?? defaultFuseOptions.keys,
        location: params.fuseOpts.location ?? 0,
        threshold: params.fuseOpts.threshold ?? defaultFuseOptions.threshold,
        distance: params.fuseOpts.distance ?? defaultFuseOptions.distance,
        ignoreLocation: params.fuseOpts.ignorelocation ?? defaultFuseOptions.ignoreLocation
    };
};

const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => fn(...args), delay);
    };
};

const reset = () => {
    currentElement = null;
    firstResult = null;
    lastResult = null;
    resList.innerHTML = '';
    sInput.value = '';
    searchGuide?.removeAttribute('hidden');
    if (searchStatus) {
        searchStatus.hidden = true;
        searchStatus.textContent = '';
    }
    sInput.focus();
};

const setActiveResult = (element) => {
    document.querySelectorAll('.focus').forEach((item) => item.classList.remove('focus'));

    if (!element) {
        return;
    }

    element.focus();
    element.parentElement?.classList.add('focus');
    currentElement = element;
};

const findExactMatch = (text, query) => {
    if (!text || !query) {
        return null;
    }

    const lowerText = text.toLocaleLowerCase();
    const candidates = [
        query,
        ...query.split(/\s+/).filter((term) => term.length >= 2)
    ];

    for (const candidate of candidates) {
        const index = lowerText.indexOf(candidate.toLocaleLowerCase());
        if (index >= 0) {
            return {
                index,
                text: text.slice(index, index + candidate.length)
            };
        }
    }

    return null;
};

const getResultContext = (result, query) => {
    const content = result.item.content || '';
    const contentMatch = findExactMatch(content, query);
    const titleMatch = findExactMatch(result.item.title || '', query);
    const match = contentMatch || titleMatch;

    let snippet = result.item.summary || '';
    if (contentMatch) {
        const start = Math.max(0, contentMatch.index - 55);
        const end = Math.min(content.length, contentMatch.index + contentMatch.text.length + 95);
        snippet = `${start > 0 ? '…' : ''}${content.slice(start, end).trim()}${end < content.length ? '…' : ''}`;
    }

    return {
        snippet: snippet.replace(/\s+/g, ' '),
        target: match?.text || ''
    };
};

const renderResults = (results, query) => {
    searchGuide?.toggleAttribute('hidden', Boolean(query));

    if (!Array.isArray(results) || results.length === 0) {
        resList.innerHTML = '';
        firstResult = lastResult = currentElement = null;
        if (searchStatus) {
            searchStatus.hidden = !query;
            searchStatus.textContent = query
                ? `没有找到与“${query}”相关的内容，请尝试更短或更通用的关键词。`
                : '';
        }
        return;
    }

    if (searchStatus) {
        searchStatus.hidden = false;
        searchStatus.textContent = `找到 ${results.length} 篇相关内容。`;
    }

    const fragment = document.createDocumentFragment();

    for (const result of results) {
        const context = getResultContext(result, query);
        const li = document.createElement('li');
        const resultContent = document.createElement('div');
        resultContent.className = 'search-result__content';

        const title = document.createElement('div');
        title.className = 'search-result__title';
        title.textContent = result.item.title;
        resultContent.appendChild(title);

        if (context.snippet) {
            const snippet = document.createElement('p');
            snippet.className = 'search-result__snippet';
            snippet.textContent = context.snippet;
            resultContent.appendChild(snippet);
        }

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.classList.add('feather', 'feather-chevrons-right');
        svg.innerHTML = '<polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline>';

        const link = document.createElement('a');
        const destination = new URL(result.item.permalink, window.location.origin);
        if (context.target) {
            destination.searchParams.set('q', context.target);
        }
        link.className = 'entry-link';
        link.href = destination.toString();
        link.setAttribute('aria-label', `${result.item.title}：跳转到关键词位置`);

        li.appendChild(resultContent);
        li.appendChild(svg);
        li.appendChild(link);
        fragment.appendChild(li);
    }

    resList.innerHTML = '';
    resList.appendChild(fragment);
    firstResult = resList.firstElementChild;
    lastResult = resList.lastElementChild;
};

const performSearch = () => {
    if (!fuse) {
        return;
    }

    const query = sInput.value.trim();
    if (!query) {
        renderResults([], '');
        return;
    }

    const searchOptions = params.fuseOpts?.limit ? { limit: params.fuseOpts.limit } : undefined;
    const results = searchOptions ? fuse.search(query, searchOptions) : fuse.search(query);
    renderResults(results, query);
};

const initSearch = async () => {
    if (!sInput || !resList) {
        return;
    }

    sInput.disabled = false;
    sInput.focus();

    try {
        const response = await fetch('../index.json');
        if (!response.ok) {
            throw new Error(`Search index load failed: ${response.status}`);
        }

        const data = await response.json();
        if (data) {
            fuse = new Fuse(data, buildFuseOptions());
        }
    } catch (error) {
        console.error(error);
    }
};

window.addEventListener('load', initSearch);

sInput?.addEventListener('input', debounce(performSearch, 150));

sInput?.addEventListener('search', () => {
    if (!sInput.value) {
        reset();
    }
});

document.addEventListener('keydown', (event) => {
    const { key } = event;
    const active = document.activeElement;
    const isInSearchBox = searchBox?.contains(active);

    if (key === 'Escape') {
        reset();
        return;
    }

    if (!firstResult || !isInSearchBox) {
        return;
    }

    if (key === 'ArrowDown') {
        event.preventDefault();

        if (active === sInput) {
            setActiveResult(firstResult.querySelector('.entry-link'));
        } else if (active?.parentElement !== lastResult) {
            setActiveResult(active?.parentElement?.nextElementSibling?.querySelector('.entry-link'));
        }
    } else if (key === 'ArrowUp') {
        event.preventDefault();

        if (active?.parentElement === firstResult) {
            setActiveResult(sInput);
        } else if (active !== sInput) {
            setActiveResult(active?.parentElement?.previousElementSibling?.querySelector('.entry-link'));
        }
    } else if (key === 'ArrowRight') {
        if (active?.matches?.('.entry-link')) {
            active.click();
        }
    }
});
