import type { EventLetters } from './letter.ts'

export const PEOPLE_EVENTS: Pick<EventLetters, 'blocked' | 'unhappy' | 'patch-proposed'> = {
  blocked: [
    ({ from, item, reason }) => ({
      subject: `Blocked on ${item}`,
      body: `Hi,\n\nI cannot move ${item}. It is ${reason}.\n\nI am not going to guess my way past this one: it is your call, and I would rather wait an hour than ship the wrong thing for a week.\n\nApprove it and I am back on it before the coffee goes cold. Later is fine too. I will ask again tomorrow, in the same words, because nothing about it will have changed.\n\n${from}`,
    }),
    ({ from, item, reason }) => ({
      subject: `${item} is stuck`,
      body: `Hello,\n\nA short one: ${item} is stuck, and the reason is simple. It is ${reason}.\n\nEverything else on the backlog is moving. This is the only thing on my desk that needs a person rather than an afternoon.\n\nApprove and I will finish it. Later and I will bring it back to you tomorrow, which is the same request with a day's worth of dust on it.\n\nThanks,\n${from}`,
    }),
  ],

  unhappy: [
    ({ from, pages, gap }) => ({
      subject: 'Can we talk?',
      body: `Hi,\n\nI have been meaning to say this for a while, and the pager has made the decision for me.\n\nI have been paged ${pages} time${pages === '1' ? '' : 's'}, and my pay sits ${gap} below what this Era pays for my work. I am not angry. I am tired, and tired is worse, because it lasts.\n\nThree things would help. Give me time off, and I will come back the person you hired. Raise my salary and I will stop reading job posts on my phone. Or accept my resignation, and I will leave with good things to say about you, which is rarer than it sounds.\n\n${from}`,
    }),
    ({ from, pages, gap }) => ({
      subject: 'Before I decide anything',
      body: `${from} here.\n\nI want to be direct, because the alternative is being quiet and then leaving.\n\nThe on-call has woken me ${pages} time${pages === '1' ? '' : 's'}. My pay is ${gap} under the going rate for what I do now. I can carry one of those. Not both, not forever.\n\nTime off, a raise, or my notice. Any of the three is an honest answer, and I will respect it. What I cannot do is pretend I am fine for another month.\n\n${from}`,
    }),
  ],

  'patch-proposed': [
    ({ from, item, target, due }) => ({
      subject: `${target}: I can patch this`,
      body: `Hi,\n\nThe advisory that just landed is in code I own: ${target}. The ticket is ${item}, due in ${due}.\n\nI can take it now and put the product work down, or it can wait its turn at the back of the backlog like everything else. My preference is now, and my preference is not the one that ships the Feature.\n\nPatch now moves it to the top. Queue the patch leaves it where it is. Both are a decision; only one of them is a decision I can make.\n\n${from}`,
    }),
    ({ from, item, target, due }) => ({
      subject: `My name is on the ${target} patch`,
      body: `Hello,\n\nQuick note from the person who will be reading the postmortem. ${target} has a published vulnerability, and the ticket is ${item}, due in ${due}.\n\nI know the code, I know the exploit, and I know how long the fix takes, which is not long. What I do not know is whether you would rather have this than the next Feature.\n\nPatch now, if you want it gone. Queue the patch, if you want to gamble on a deadline. I will be here either way.\n\n${from}`,
    }),
  ],
}
