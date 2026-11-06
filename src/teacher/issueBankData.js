/**
 * Default issue bank — Mansfield State High School, Year 7 English,
 * Task 2: Persuasive Spoken Response (draft feedback sheet, 2026).
 * Aligns to faculty sheet: Application, Organisation/Development, Textual Features.
 * Students revise the draft, then submit via QLearn / Turnitin per school process.
 * `oneLiner` — short line under the title in the issue list (what this issue is for).
 */
export const DEFAULT_ISSUE_BANK = [
  {
    id: 'm7-app-pov',
    defaultPriority: 'high',
    title: 'Application — point of view & reasons',
    oneLiner: 'Stance, reasons, or “because” vague or under-explained.',
    whyItMatters:
      'A persuasive response needs a clear line of argument: what you believe, and why, on your chosen topic. The sheet asks for more clarity in reasons and a sense of why this answer is the best for you or for others, not a vague list of points.',
    nextStep:
      'Add one sentence that names your point of view in a single line, then two short reasons, each with a “because” that links to who is affected and why that matters to your audience of peers and teachers.',
  },
  {
    id: 'm7-app-schc',
    defaultPriority: 'high',
    title: 'Application — social, historical, cultural, values',
    oneLiner: 'Needs stronger real-world, historical, or cultural grounding.',
    whyItMatters:
      'Strong speeches ground opinion in context: how health, education, and wellbeing; historical origins, figures, or events; and cultural or popular beliefs back your stance. The rubric also asks for underlying values and beliefs to be made explicit, not only implied.',
    nextStep:
      'Name one type of context you have under-used (social, historical, or cultural) and add one example or reference that your audience will recognise, then one line that states a value (e.g. fairness, safety, community) you are defending.',
  },
  {
    id: 'm7-app-persuasive',
    defaultPriority: 'medium',
    title: 'Application — persuasive language for audience',
    oneLiner: 'Does not feel aimed or persuasive for peers and teachers.',
    whyItMatters:
      'Language choices should be tuned to persuade peers and teachers: rhetorical questions, direct address, repetition, rule of three, and tone that fits the form. The sheet also asks to review whether the features you chose fit the message and the audience.',
    nextStep:
      'Circle one place where you can replace a plain statement with a direct question to the audience, or a short, memorable phrase repeated once for effect—then read it aloud: does it sound like speech, not an essay read word-for-word?',
  },
  {
    id: 'm7-org-intro',
    defaultPriority: 'high',
    title: 'Organisation — introduction & hook',
    oneLiner: 'Opening unclear, slow, or missing a hook and topic set-up.',
    whyItMatters:
      'In this genre, the opening should win attention and name the issue quickly. The sheet lists hook types (quotation, rhetorical question, anecdote) and expects the topic to be made clear to listeners early.',
    nextStep:
      'Draft one opening: first sentence = hook, second = topic in plain words. Time it: if it runs past about 20–30 seconds, trim so your audience knows what you are arguing for before the first main point.',
  },
  {
    id: 'm7-org-main',
    defaultPriority: 'high',
    title: 'Organisation — main argument (TEEL) & scaffold',
    oneLiner: 'Main reason asserted but not built with TEEL, evidence, and link.',
    whyItMatters:
      'The main case should use TEEL (topic sentence, explanation, evidence, link) and the debate scaffold your class is using, so each reason is developed, not only asserted. That matches how markers read “use of genre-specific elements.”',
    nextStep:
      'Take your strongest reason and re-order one paragraph into: topic sentence, one example or fact, a sentence that explains what that example proves, and a line that links back to your overall argument.',
  },
  {
    id: 'm7-org-rebuttal',
    defaultPriority: 'high',
    title: 'Organisation — rebuttal (respectful, TEEL)',
    oneLiner: 'Counter-argument missing, thin, dismissive, or off-task.',
    whyItMatters:
      'A spoken persuasive often includes a fair counter-argument, then a response. The task expects a rebuttal that is respectful in tone and structured (e.g. TEEL), not a personal attack on people who disagree.',
    nextStep:
      'Name the strongest opposing view in a neutral one-sentence “Some people would say…”, then answer with evidence and a clear link to why your position still holds. Read it aloud: does it stay polite and on-topic?',
  },
  {
    id: 'm7-org-conclusion',
    defaultPriority: 'medium',
    title: 'Organisation — conclusion & emphasis',
    oneLiner: 'Ending messy, adds new content, or does not land the line of argument.',
    whyItMatters:
      'The ending should restate the point of view, briefly recall key points, and leave a clear, memorable finish—without new evidence or a brand-new line of thought.',
    nextStep:
      'Write a final minute that: (1) signals you are closing, (2) restates your stance, (3) ends with one line you want the audience to remember. Cut anything that introduces a new sub-topic.',
  },
  {
    id: 'm7-org-evidence',
    defaultPriority: 'high',
    title: 'Organisation — subject matter, evidence, appeals, timing',
    oneLiner: 'Support thin, shaky, unbalanced, or script does not match speech length.',
    whyItMatters:
      'Ideas and opinions need reliable support: credible evidence, claims that follow from it, and balance of Logos, Pathos, and Ethos. The task also flags timing—if the written draft is too long or too short, the real speech is unlikely to sit in the allowed time.',
    nextStep:
      'Check one fact or example: name the source in speech-friendly words (“A school survey from …”, “A news report said …”) and add one line that is clearly logical appeal, one that touches emotion fairly, and one that builds your credibility. Read with a stopwatch: aim for a spoken length that fits the task’s time limit.',
  },
  {
    id: 'm7-org-cohesion',
    defaultPriority: 'medium',
    title: 'Organisation — sequence & cohesion',
    oneLiner: 'Order, links, or sentence length make the speech hard to follow aloud.',
    whyItMatters:
      'Listeners need clear, succinct points and signposting so they can follow. The sheet calls out long, tangled sentences and weak order between parts of the speech, as well as conjunctions and connective phrases to show logic and topic change.',
    nextStep:
      'In one “messy” paragraph, break long sentences in two, add a connective (e.g. “However…”, “As a result…”, “The next reason is…”) at the start of a sentence, and consider whether two ideas should swap order so the argument builds.',
  },
  {
    id: 'm7-text-vocab',
    defaultPriority: 'low',
    title: 'Textual — vocabulary (spoken, audience, dictionary)',
    oneLiner: 'Word choice vague, wrong register, or risky for the audience.',
    whyItMatters:
      'A spoken text should sound like you, but also reach teachers and peers: a mix of everyday and precise words. The rubric says to extend vocabulary but not to use unfamiliar words without checking, which matters for EALD and early secondary writers.',
    nextStep:
      'Replace one vague word (“good”, “bad”, “things”) with a more exact choice you have looked up, or explain a necessary technical term the first time you use it, in a short appositive for listeners.',
  },
  {
    id: 'm7-text-grammar',
    defaultPriority: 'medium',
    title: 'Textual — spoken grammar & tone (not an essay on paper)',
    oneLiner: 'Reads like a written essay or the tone is wrong for a spoken text.',
    whyItMatters:
      'The draft may read with long “essay” sentences, questions, and fragments that are strong for speech, or with tone that is too stiff, too chatty, or over-emotional when read aloud. Variety of sentence length and type supports emphasis when speaking.',
    nextStep:
      'Read two paragraphs aloud: mark one long sentence to split, one place for a short fragment for punch, and one line where the tone is too written—rewrite it the way you would really say it to a friend, then a teacher.',
  },
  {
    id: 'm7-text-delivery',
    defaultPriority: 'medium',
    title: 'Textual — verbal, nonverbal, rehearsal',
    oneLiner: 'For sound, look, and rehearsal—beyond the written script alone.',
    whyItMatters:
      'Delivery (pace, volume, clarity, pausing, emphasis, and body language) is part of the text in a spoken response. The sheet’s tip to rehearse with an “honest grown-up” is about honest feedback on both words and how they are said.',
    nextStep:
      'In rehearsal, choose three moments for a deliberate pause after a key line, and ask your listener: were eye contact, posture, and gesture helping you believe the argument, or were they distracting? Note one change for your next run-through.',
  },
]
