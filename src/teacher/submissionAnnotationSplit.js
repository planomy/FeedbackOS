export function buildFlatIndex(chunks) {
  let flat = ''
  const indexMap = {}
  chunks.forEach((chunk, chunkIdx) => {
    if (typeof chunk === 'string') {
      for (let i = 0; i < chunk.length; i++) {
        indexMap[flat.length] = { chunkIdx, offsetInChunk: i, kind: 'string' }
        flat += chunk[i]
      }
    } else {
      const t = chunk.text
      for (let i = 0; i < t.length; i++) {
        indexMap[flat.length] = { chunkIdx, offsetInChunk: i, kind: 'annotation' }
        flat += t[i]
      }
    }
  })
  return { flat, indexMap, length: flat.length }
}

/** Selection must lie in a single plain string chunk (not inside an existing chip). */
export function tryAddAnnotationFromRange(chunks, startFlat, endFlat, newId) {
  const { flat, indexMap } = buildFlatIndex(chunks)
  if (startFlat < 0 || endFlat > flat.length || startFlat >= endFlat) return null
  const i0 = indexMap[startFlat]
  const i1 = indexMap[endFlat - 1]
  if (!i0 || !i1) return null
  if (i0.kind !== 'string' || i1.kind !== 'string') return null
  if (i0.chunkIdx !== i1.chunkIdx) return null
  const ci = i0.chunkIdx
  const str = chunks[ci]
  if (typeof str !== 'string') return null
  const sliceFlat = flat.slice(startFlat, endFlat)
  const before = str.slice(0, i0.offsetInChunk)
  const middle = str.slice(i0.offsetInChunk, i1.offsetInChunk + 1)
  const after = str.slice(i1.offsetInChunk + 1)
  if (middle !== sliceFlat) return null
  const out = [...chunks.slice(0, ci)]
  if (before) out.push(before)
  out.push({ id: newId, text: middle })
  if (after) out.push(after)
  out.push(...chunks.slice(ci + 1))
  return out
}

/** Merge neighbouring string chunks after removing an annotation chip. */
export function mergeAdjacentStringChunks(chunks) {
  if (!Array.isArray(chunks)) return chunks
  const out = []
  for (const ch of chunks) {
    if (typeof ch === 'string' && out.length > 0 && typeof out[out.length - 1] === 'string') {
      out[out.length - 1] += ch
    } else {
      out.push(ch)
    }
  }
  return out
}

/** Replace `{ id, text }` with plain text and merge adjacent strings. */
export function removeAnnotationFromChunks(chunks, annotationId) {
  if (!Array.isArray(chunks)) return chunks
  const next = []
  for (const ch of chunks) {
    if (typeof ch === 'string') {
      next.push(ch)
    } else if (ch && ch.id === annotationId) {
      next.push(ch.text)
    } else {
      next.push(ch)
    }
  }
  return mergeAdjacentStringChunks(next)
}

export function nextAnnotationId(comments, submission) {
  let max = 0
  const scan = (id) => {
    const m = /^a(\d+)$/.exec(id)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  for (const c of comments) scan(c.id)
  for (const p of submission.paragraphs) {
    for (const ch of p.text) {
      if (typeof ch !== 'string') scan(ch.id)
    }
  }
  return `a${max + 1}`
}

export function getParagraphFlatLength(chunks) {
  return buildFlatIndex(chunks).length
}

/**
 * Range for a paragraph-scoped issue (“Tag end”): spans the full trailing plain-text run in
 * its chunk — usually the entire paragraph when it is one undivided string, not a clipped tail.
 * @returns {{ start: number, end: number, quote: string } | null}
 */
export function getEndOfParagraphAnnotationRange(chunks) {
  const { flat, indexMap } = buildFlatIndex(chunks)
  if (flat.length === 0) return null
  const e = flat.length
  let k = e - 1
  while (k >= 0) {
    if (indexMap[k]?.kind === 'string') break
    k--
  }
  if (k < 0) return null
  const m = indexMap[k]
  let j = k
  while (j > 0) {
    const prev = indexMap[j - 1]
    if (prev && prev.kind === 'string' && prev.chunkIdx === m.chunkIdx) j--
    else break
  }
  const strStart = j
  const end = k + 1
  const start = strStart
  if (start >= end) return null
  if (!indexMap[start] || indexMap[start].kind !== 'string' || indexMap[start].chunkIdx !== m.chunkIdx) {
    return null
  }
  if (!tryAddAnnotationFromRange(chunks, start, end, '__dry__')) return null
  return { start, end, quote: flat.slice(start, end) }
}

export function getTextOffsetsInParagraph(paragraphEl, range) {
  if (!paragraphEl.contains(range.commonAncestorContainer)) return null
  try {
    const pre = document.createRange()
    pre.selectNodeContents(paragraphEl)
    pre.setEnd(range.startContainer, range.startOffset)
    const start = pre.toString().length
    pre.setEnd(range.endContainer, range.endOffset)
    const end = pre.toString().length
    if (start > end) return null
    return { start, end }
  } catch {
    return null
  }
}

export function selectionIntersectsAnnotationChip(range, paragraphEl) {
  const chips = paragraphEl.querySelectorAll('.annotation-chip')
  for (const chip of chips) {
    if (range.intersectsNode(chip)) return true
  }
  return false
}

/**
 * True when a collapsed caret sits inside an annotation chip’s DOM subtree.
 * Prefer this over intersectsNode for collapsed ranges: some browsers report
 * intersectsNode=true for a caret placed immediately after a chip, which
 * blocked “click at end of paragraph” to start a new issue.
 */
export function collapsedCaretInsideAnnotationChip(range, paragraphEl) {
  if (!range.collapsed) return false
  const node = range.startContainer
  for (const chip of paragraphEl.querySelectorAll('.annotation-chip')) {
    if (chip.contains(node)) return true
  }
  return false
}
