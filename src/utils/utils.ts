export function saveSelectionRange(): Range | null {
  const selection = document.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return null;
  }
  return selection.getRangeAt(0).cloneRange();
}

export function syncProseMirrorEditor(editorEl: HTMLElement | null) {
  if (!editorEl) {
    return;
  }

  const editor = (editorEl as HTMLElement & { __tiptapEditor?: { commands: { setContent: (content: string, options?: { emitUpdate?: boolean }) => void } } }).__tiptapEditor;
  if (editor) {
    editor.commands.setContent(editorEl.innerHTML, { emitUpdate: true });
  }

  document.getSelection()?.removeAllRanges();
}

export function wrapRangeWithCommentSpan(range: Range, uuid: string): HTMLSpanElement | null {
  const kspan = document.createElement('span');
  kspan.setAttribute('kommentti', uuid);

  try {
    range.surroundContents(kspan);
  }
  catch {
    try {
      const fragment = range.extractContents();
      kspan.appendChild(fragment);
      range.insertNode(kspan);
    }
    catch {
      return null;
    }
  }

  return kspan;
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

export function unwrapAndSyncProseMirror(el: HTMLElement | null) {
  if (!el) {
    return;
  }

  const editorEl = el.closest('.ProseMirror');
  unwrap(el);
  syncProseMirrorEditor(editorEl as HTMLElement | null);
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
    // Handle HTML entities
    if (innerHtml[idx] === '&') {
      const start = idx;
      idx++;

      // Bounds check
      if (idx >= innerHtml.length) {
        break;
      }

      // Parse numeric entity (&#123;) or named entity (&nbsp;)
      if (innerHtml[idx] === '#') {
        idx++;
        while (idx < innerHtml.length && innerHtml[idx].match(/\d/)) {
          idx++;
        }
      }
      else {
        while (idx < innerHtml.length && innerHtml[idx].match(/[a-zA-Z]/)) {
          idx++;
        }
      }

      // Check if it's a valid entity pattern
      if (idx < innerHtml.length && innerHtml[idx] === ';') {
        idx++; // Move past the semicolon
        const size = idx - start - 1;
        entities += size;
        continue;
      }
      else {
        // Not a valid entity, reset to after '&'
        idx = start + 1;
      }
    }

    // Bounds check before accessing current character
    if (idx >= innerHtml.length) {
      break;
    }

    // Handle opening tag
    if (innerHtml[idx] === '<') {
      depth++;
      lastIndent = idx;
    }

    // Count tag characters
    if (depth > 0) {
      tagAmount++;
    }

    // Handle closing tag
    if (innerHtml[idx] === '>') {
      depth--;
    }

    // Check if we've reached the target position in text-only version
    if (idx - tagAmount >= targetIdx) {
      return idx + entities;
    }

    idx++;
  }

  // If we've exhausted the string and have a last tag position, return it
  if (lastIndent > -1 && depth === 0) {
    return lastIndent;
  }

  return -1;
}
