export function unwrap(el: HTMLElement | null) {
  if (!el || !el.parentNode) {
    return;
  }

  while (el.firstChild) {
    el.parentNode.insertBefore(el.removeChild(el.firstChild), el);
  }
  el.parentNode.removeChild(el);
}

export function findIndexWithTagsIncluded(innerHtml: string, targetIdx: number) {
  if (targetIdx < 0) {
    return -1;
  }

  let idx = 0;
  let tagAmount = 0;
  let depth = 0;
  let entities = 0;
  let lastIndent = -1;

  while (idx < innerHtml.length) {
    if (innerHtml[idx] === '&') {
      const start = idx;
      ++idx;
      if (innerHtml[idx] === '#') {
        ++idx;
        while (innerHtml[idx].match('\\d')) {
          ++idx;
        }
      }
      else {
        while (innerHtml[idx].match('[a-zA-Z]')) {
          ++idx;
        }
      }

      if (innerHtml[idx] === ';') {
        ++idx;
        const size = idx - start - 1;
        entities += size;
      }
      else {
        idx = start + 1;
      }
    }

    if (innerHtml[idx] === '<') {
      ++depth;
      lastIndent = idx;
    }

    if (depth > 0) {
      ++tagAmount;
    }

    if (innerHtml[idx] === '>') {
      --depth;
    }

    const ch = innerHtml[idx];
    if (idx - tagAmount >= targetIdx) {
      return idx + entities;
    }

    ++idx;
  }

  if (lastIndent > -1 && depth === 0) {
    return lastIndent;
  }

  return -1;
}
