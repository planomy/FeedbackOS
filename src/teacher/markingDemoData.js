import { issueTemplate } from '../lib/issueBankStore.js'
export { issueTemplate }

/**
 * Sample draft: Year 7 persuasive spoken response (written script / transcript style).
 * Matches MSHS Task 2: Persuasive Spoken Response — for faculty preview before QLearn + Turnitin.
 */
export const DEFAULT_SUBMISSION = {
  paragraphs: [
    {
      text: [
        'Some people like early starts, but I do not, so I am going to talk about that today. I think the topic is important and everyone in Year 7 will understand because it affects all of us when we are tired, so that is my basic idea for the speech. We have to be persuasive and I will try to do that. Thank you for listening in advance, I hope I do okay.',
      ],
    },
    {
      text: [
        'I believe very strongly that school should start a bit later for teenagers because sleep matters and our brains are still growing, which is a scientific fact. Starting later would help with concentration and with mood, and I read online that a lot of schools in other countries do it, so that proves it. ',
        { id: 'a1', text: 'Basically the main thing is I think I am right and that is the point I want to get across' },
        ' in this part of the speech, because if you are not too tired you can do better in class, which is the whole point of the argument I will keep saying.',
      ],
    },
    {
      text: [
        'In the part where I give the main line of thinking, ',
        { id: 'a2', text: 'the issue of sleep deprivation among adolescents in contemporary educational settings has been documented extensively by researchers who work in the field of chronobiology' },
        ' and it is a widely acknowledged phenomenon that the circadian rhythms of people aged approximately twelve to fifteen are misaligned with conventional early start times, meaning that a policy which prioritises a schedule that is more harmonised with the biological exigencies of the cohort would, if implemented in a considered manner, be likely to yield a net benefit in terms of academic and wellbeing outcomes, notwithstanding practical constraints. ',
        { id: 'a3', text: 'That is my second reason and I think you can see the logic' },
        ' and that is the centre of the persuasive thing I need to do for the task.',
      ],
    },
    {
      text: [
        'I know some teachers would say the timetable is the timetable and you just have to deal with it, and some parents have to get to work early, but I do not think that is fair as the only reason because you could talk about buses. ',
        { id: 'a3', text: 'I do not really have social or historical or cultural things here yet I know we need that for the task so I will add a bit later' },
        ' and also I have not had time to put the rebuttal in a TEEL. But I will say they are wrong about tiredness not mattering, because I feel tired, so I know.',
      ],
    },
    {
      text: [
        'If we started even thirty minutes later, I would still come on time, and I would bring my food and not be in a bad mood. That is a reason from real life, not a random story, and I think the evidence is true because I feel it, so the audience of peers and teachers can trust me, and the persuasive language is like: imagine how much better the morning would feel, which I put in a rhetorical kind of way, even though I have not read this paragraph out loud to check the tone, which might be too long when I get nervous.',
      ],
    },
    {
      text: [
        'So, to finish up, there are a lot of reasons, like sleep, mood, and concentration, and other places do it, and being tired is not good for learning. ',
        { id: 'a4', text: 'Please consider changing the start time because I have explained everything' },
        ' and in conclusion that is all my arguments together and the counter-thing as well, even though the earlier paragraph was still a bit short on structure. I hope the school can think about it and I would be happy to answer a question, thank you.',
      ],
    },
  ],
}

export const DEFAULT_COMMENTS = [
  {
    id: 'a1',
    issueId: 'm7-app-pov',
    annotationType: 'improvement',
    priority: issueTemplate('m7-app-pov').defaultPriority,
    label: 'Annotation a1',
    issueTitle: issueTemplate('m7-app-pov').title,
    whyItMatters:
      'The sheet asks for clear reasons and an explanation of why your view is a strong or fair answer, not a general statement that you are "right." That line is hard for listeners to use when revising.',
    nextStep:
      'Redraft: one clear sentence of belief, then two "because" reasons that name who benefits (you, the year group, teachers) in plain speech. Cut "basically" if it hides the real claim.',
  },
  {
    id: 'a2',
    issueId: 'm7-text-grammar',
    annotationType: 'improvement',
    priority: issueTemplate('m7-text-grammar').defaultPriority,
    label: 'Annotation a2',
    issueTitle: issueTemplate('m7-text-grammar').title,
    whyItMatters:
      'This part sounds like a copied essay, not a speech. The faculty sheet asks for a variety of sentence types and a tone that works when read aloud, not a dense chain of abstractions in one breath.',
    nextStep:
      'Break this into short spoken sentences; swap jargon for plain words unless your teacher has taught the term. Read the paragraph to someone: if they look lost, cut adjectives and keep one main claim per line.',
  },
  {
    id: 'a3',
    issueId: 'm7-org-main',
    annotationType: 'improvement',
    priority: issueTemplate('m7-org-main').defaultPriority,
    label: 'Annotation a3',
    issueTitle: issueTemplate('m7-org-main').title,
    whyItMatters:
      'The line you highlighted is a label, not a developed reason. The Task 2 sheet expects a main argument built with TEEL (and your debate scaffold), with explanation and a link, not a sentence that only says the logic is visible.',
    nextStep:
      'Build one full TEEL block: topic, one piece of evidence you could say in a competition round, a sentence on why that evidence matters for your “later start” claim, and a line that links to your opening.',
  },
  {
    id: 'a4',
    issueId: 'm7-app-schc',
    annotationType: 'improvement',
    priority: issueTemplate('m7-app-schc').defaultPriority,
    label: 'Annotation a4',
    issueTitle: issueTemplate('m7-app-schc').title,
    whyItMatters:
      'The draft flags that social, historical, and cultural context is not yet in place. The rubric expects you to build reasons from at least one of these angles, and to be explicit about values, not only personal feeling.',
    nextStep:
      'Add one line about a shared value (e.g. fairness, safety) and one example of context other people in the room will recognise: school routine, a common bus problem, a policy change you know about, or a story from a source you can name.',
  },
  {
    id: 'a5',
    issueId: 'm7-org-conclusion',
    annotationType: 'strength',
    priority: issueTemplate('m7-org-conclusion').defaultPriority,
    label: 'Annotation a5',
    issueTitle: 'A clear end to the speech',
    whyItMatters:
      'The conclusion signals a finish, restates the topic in plain language, and says thank you, which helps the audience. With TEEL in the rebuttal tightened and context added, this close can be sharpened, not replaced.',
    nextStep:
      'Prune the apology-like lines, keep one short recap of the three strongest reasons, then a single, memorable line you want the room to leave with, then stop—match the time limit in the task sheet when you read aloud with a stopwatch.',
    quote: 'Please consider changing the start time because I have explained everything',
  },
]
