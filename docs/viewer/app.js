const docs = [
  { title: 'README', url: '/documentation/files/README.md' },
  { title: 'Installation', url: '/documentation/files/docs/INSTALLATION.md' },
  { title: 'Architecture', url: '/documentation/files/docs/ARCHITECTURE.md' },
  { title: 'Files Reference', url: '/documentation/files/docs/FILES_REFERENCE.md' },
  { title: 'Logger', url: '/documentation/files/docs/LOGGER.md' },
  { title: 'Project Customization', url: '/documentation/files/docs/PROJECT_CUSTOMIZATION.md' },
  { title: 'Request Flows', url: '/documentation/files/docs/REQUEST_FLOWS.md' },
  { title: 'Troubleshooting', url: '/documentation/files/docs/TROUBLESHOOTING.md' },
];

const listElement = document.getElementById('doc-list');
const titleElement = document.getElementById('doc-title');
const contentElement = document.getElementById('doc-content');
const rawLinkElement = document.getElementById('raw-link');
const searchFormElement = document.getElementById('search-form');
const searchInputElement = document.getElementById('search-input');
const searchStatusElement = document.getElementById('search-status');
const searchResultsElement = document.getElementById('search-results');

const docCache = new Map();
let currentDoc = null;
let activeSearchTerm = '';

const escapeHtml = (input) =>
  input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const renderInline = (text) => {
  let output = escapeHtml(text);
  output = output.replace(/`([^`]+)`/g, '<code>$1</code>');
  output = output.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  output = output.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  output = output.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  return output;
};

const tokenizeCodeFences = (markdown) => {
  const blocks = [];
  const transformed = markdown.replace(
    /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g,
    (_, language, code) => {
      const token = `@@CODE_BLOCK_${blocks.length}@@`;
      blocks.push({ language: language || 'text', code });
      return token;
    },
  );

  return { transformed, blocks };
};

const parseTable = (lines, startIndex) => {
  if (!lines[startIndex].includes('|')) {
    return null;
  }

  const headerLine = lines[startIndex];
  const separatorLine = lines[startIndex + 1] || '';

  if (!/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(separatorLine)) {
    return null;
  }

  const rows = [];
  let currentIndex = startIndex;

  while (currentIndex < lines.length && lines[currentIndex].includes('|')) {
    rows.push(lines[currentIndex]);
    currentIndex += 1;
  }

  const splitRow = (row) =>
    row
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => renderInline(cell.trim()));

  const headers = splitRow(headerLine);
  const bodyRows = rows.slice(2).map(splitRow);

  let html = '<table><thead><tr>';
  headers.forEach((header) => {
    html += `<th>${header}</th>`;
  });
  html += '</tr></thead><tbody>';

  bodyRows.forEach((row) => {
    html += '<tr>';
    row.forEach((cell) => {
      html += `<td>${cell}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';

  return { html, nextIndex: currentIndex };
};

const markdownToHtml = (markdown) => {
  const { transformed, blocks } = tokenizeCodeFences(markdown.replace(/\r\n/g, '\n'));
  const lines = transformed.split('\n');
  const html = [];

  let index = 0;
  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const table = parseTable(lines, index);
    if (table) {
      html.push(table.html);
      index = table.nextIndex;
      continue;
    }

    const codeTokenMatch = line.match(/^@@CODE_BLOCK_(\d+)@@$/);
    if (codeTokenMatch) {
      const block = blocks[Number(codeTokenMatch[1])];
      html.push(
        `<pre><code class="language-${escapeHtml(block.language)}">${escapeHtml(block.code.trimEnd())}</code></pre>`,
      );
      index += 1;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      html.push(`<h${level}>${renderInline(headingMatch[2].trim())}</h${level}>`);
      index += 1;
      continue;
    }

    if (/^>\s?/.test(line)) {
      html.push(`<blockquote>${renderInline(line.replace(/^>\s?/, ''))}</blockquote>`);
      index += 1;
      continue;
    }

    if (/^(-|\*)\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^(-|\*)\s+/.test(lines[index])) {
        items.push(`<li>${renderInline(lines[index].replace(/^(-|\*)\s+/, ''))}</li>`);
        index += 1;
      }
      html.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index])) {
        items.push(`<li>${renderInline(lines[index].replace(/^\d+\.\s+/, ''))}</li>`);
        index += 1;
      }
      html.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    html.push(`<p>${renderInline(line.trim())}</p>`);
    index += 1;
  }

  return html.join('');
};

const getCachedDocContent = async (doc) => {
  if (docCache.has(doc.url)) {
    return docCache.get(doc.url);
  }

  const response = await fetch(doc.url);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${doc.title}`);
  }

  const markdown = await response.text();
  docCache.set(doc.url, markdown);
  return markdown;
};

const clearHighlights = () => {
  const marks = contentElement.querySelectorAll('mark.search-hit');
  marks.forEach((mark) => {
    const textNode = document.createTextNode(mark.textContent || '');
    mark.replaceWith(textNode);
  });
};

const highlightTermInContent = (term) => {
  clearHighlights();

  if (!term) {
    return { count: 0, firstMatch: null };
  }

  const lowerTerm = term.toLowerCase();
  const walker = document.createTreeWalker(contentElement, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    const textNode = walker.currentNode;
    const parentElement = textNode.parentElement;
    if (!parentElement) {
      continue;
    }

    if (!textNode.nodeValue || !textNode.nodeValue.trim()) {
      continue;
    }

    textNodes.push(textNode);
  }

  let matchCount = 0;
  let firstMatch = null;

  textNodes.forEach((textNode) => {
    const originalText = textNode.nodeValue || '';
    const lowerText = originalText.toLowerCase();
    let index = lowerText.indexOf(lowerTerm);

    if (index === -1) {
      return;
    }

    const fragment = document.createDocumentFragment();
    let cursor = 0;

    while (index !== -1) {
      if (index > cursor) {
        fragment.appendChild(document.createTextNode(originalText.slice(cursor, index)));
      }

      const mark = document.createElement('mark');
      mark.className = 'search-hit';
      mark.textContent = originalText.slice(index, index + term.length);
      fragment.appendChild(mark);

      if (!firstMatch) {
        firstMatch = mark;
      }

      matchCount += 1;
      cursor = index + term.length;
      index = lowerText.indexOf(lowerTerm, cursor);
    }

    if (cursor < originalText.length) {
      fragment.appendChild(document.createTextNode(originalText.slice(cursor)));
    }

    textNode.replaceWith(fragment);
  });

  return { count: matchCount, firstMatch };
};

const setSearchStatus = (message) => {
  searchStatusElement.textContent = message;
};

const clearSearchResults = () => {
  searchResultsElement.innerHTML = '';
};

const createSnippet = (text, query) => {
  const normalizedText = text.replace(/\s+/g, ' ').trim();
  const lowerText = normalizedText.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) {
    return normalizedText.slice(0, 110);
  }

  const start = Math.max(0, matchIndex - 45);
  const end = Math.min(normalizedText.length, matchIndex + query.length + 45);
  let snippet = normalizedText.slice(start, end);

  if (start > 0) {
    snippet = `...${snippet}`;
  }

  if (end < normalizedText.length) {
    snippet = `${snippet}...`;
  }

  return snippet;
};

const searchAcrossDocs = async (query) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length < 2) {
    clearSearchResults();
    setSearchStatus('Escribe al menos 2 caracteres para buscar.');
    return;
  }

  setSearchStatus('Buscando...');

  const results = [];

  for (const doc of docs) {
    try {
      const markdown = await getCachedDocContent(doc);
      const lines = markdown.split(/\r?\n/);

      lines.forEach((line, lineIndex) => {
        if (line.toLowerCase().includes(normalizedQuery)) {
          results.push({
            doc,
            line: lineIndex + 1,
            snippet: createSnippet(line, normalizedQuery),
          });
        }
      });
    } catch (_error) {
      // Continue searching other files even if one fails.
    }
  }

  clearSearchResults();

  if (results.length === 0) {
    setSearchStatus('Sin coincidencias para la busqueda.');
    return;
  }

  const cappedResults = results.slice(0, 60);
  const documentsWithHits = new Set(cappedResults.map((result) => result.doc.url)).size;
  setSearchStatus(`${cappedResults.length} coincidencias en ${documentsWithHits} documento(s).`);

  cappedResults.forEach((result) => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    const docLabel = document.createElement('span');
    const snippetLabel = document.createElement('span');

    button.type = 'button';
    docLabel.className = 'result-doc';
    snippetLabel.className = 'result-snippet';
    docLabel.textContent = `${result.doc.title} (linea ${result.line})`;
    snippetLabel.textContent = result.snippet;

    button.appendChild(docLabel);
    button.appendChild(snippetLabel);
    button.addEventListener('click', async () => {
      await loadDocument(result.doc, { searchTerm: normalizedQuery, scrollToFirstHit: true });
    });

    li.appendChild(button);
    searchResultsElement.appendChild(li);
  });
};

const setActiveButton = (activeUrl) => {
  const buttons = listElement.querySelectorAll('button[data-doc-url]');
  buttons.forEach((button) => {
    if (button.dataset.docUrl === activeUrl) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
};

const loadDocument = async (doc, options = {}) => {
  const { searchTerm = activeSearchTerm, scrollToFirstHit = false } = options;

  currentDoc = doc;
  setActiveButton(doc.url);
  titleElement.textContent = doc.title;
  rawLinkElement.href = doc.url;

  try {
    const markdown = await getCachedDocContent(doc);
    contentElement.innerHTML = markdownToHtml(markdown);

    const highlightResult = highlightTermInContent(searchTerm);
    if (scrollToFirstHit && highlightResult.firstMatch) {
      highlightResult.firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } catch (error) {
    contentElement.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
  }
};

searchFormElement.addEventListener('submit', async (event) => {
  event.preventDefault();
  activeSearchTerm = searchInputElement.value.trim();
  await searchAcrossDocs(activeSearchTerm);

  if (currentDoc) {
    await loadDocument(currentDoc, { searchTerm: activeSearchTerm });
  }
});

searchInputElement.addEventListener('input', async () => {
  const query = searchInputElement.value.trim();
  if (query.length === 0) {
    activeSearchTerm = '';
    clearSearchResults();
    setSearchStatus('Escribe al menos 2 caracteres para buscar.');

    if (currentDoc) {
      await loadDocument(currentDoc, { searchTerm: '' });
    }
  }
});

docs.forEach((doc) => {
  const li = document.createElement('li');
  const button = document.createElement('button');

  button.type = 'button';
  button.dataset.docUrl = doc.url;
  button.textContent = doc.title;
  button.addEventListener('click', () => {
    loadDocument(doc);
  });

  li.appendChild(button);
  listElement.appendChild(li);
});

if (docs.length > 0) {
  loadDocument(docs[0]);
}
