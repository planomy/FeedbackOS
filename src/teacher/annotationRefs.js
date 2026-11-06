export function setAnnotationRef(refMap, id, el) {
  if (el) refMap.current[id] = el
  else delete refMap.current[id]
}
