import { useEffect, useMemo, useState } from 'react'
import { getIssueBank, subscribeIssueBank } from './issueBankStore.js'

export function useIssueBank() {
  const [version, setVersion] = useState(0)
  useEffect(() => subscribeIssueBank(() => setVersion((v) => v + 1)), [])
  return useMemo(() => ({ bank: getIssueBank(), version }), [version])
}
