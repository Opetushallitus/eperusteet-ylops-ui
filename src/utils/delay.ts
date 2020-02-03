export async function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function unwrap(el: HTMLElement | null) {
  if (!el || !el.parentNode) {
    return;
  }

  while (el.firstChild) {
    el.parentNode.insertBefore(el.removeChild(el.firstChild), el);
  }
  el.parentNode.removeChild(el);
}

export function findTaggedIndex(innerHtml: string, targetIdx: number) {
  let idx = 0;
  let tagAmount = 0;
  let depth = 0;

  while (idx < innerHtml.length) {
    if (innerHtml[idx] === '<') {
      ++depth;
    }

    if (depth > 0) {
      ++tagAmount;
    }

    if (innerHtml[idx] === '>') {
      --depth;
    }

    if (idx - tagAmount >= targetIdx) {
      return idx;
    }

    ++idx;
  }

  return -1;
}
