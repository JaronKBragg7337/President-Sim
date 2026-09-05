// Reality supplies the premise. Dialogue, policy options and effects are authored fiction.
export const pack = {
  id: "power-of-the-office-2026-09",
  version: 1,
  title: "The price of progress",
  verifiedAt: "2026-09-04",
  reviewAfter: "2026-10-04",
  sources: [
    {
      title: "White House · Ratepayer Protection Pledge",
      date: "2026-03-04",
      url: "https://www.whitehouse.gov/releases/2026/03/ratepayer-protection-pledge/",
      note: "Describes commitments to cover data-center energy and infrastructure costs. A pledge is not a guarantee of outcomes.",
    },
    {
      title: "AP · Expansion of the voluntary pledge",
      date: "2026-07-23",
      url: "https://apnews.com/article/490ea7e4c7227d5e550b00a0056c33c9",
      note: "Independent reporting on the expanded pledge and the role of states and utility commissions.",
    },
    {
      title: "OpenAI · Stargate announcement",
      date: "2025-01-21",
      url: "https://openai.com/index/announcing-the-stargate-project/",
      note: "An announced intention to invest up to $500 billion over four years, not a measure of completed investment.",
    },
    {
      title: "NVIDIA · H20 licensing announcement",
      date: "2025-07-14",
      url: "https://blogs.nvidia.com/blog/nvidia-ceo-promotes-ai-in-dc-and-china/",
      note: "Historical company account of H20 licensing discussions. The chip hearing below is a fictional policy exercise, not a statement of today’s export rules.",
    },
  ],
};
export const actors = {
  aide: {
    name: "Alex Morgan",
    role: "Chief of staff",
    motive: "Keep promises executable and the administration together.",
    color: "#b8cbdf",
    skin: "#a36c4c",
    hair: "#31221c",
    suit: "#273b4f",
  },
  sam: {
    name: "Sam Altman",
    role: "OpenAI CEO · dramatized",
    motive: "Secure the power and infrastructure to expand American AI.",
    color: "#b3d5cc",
    skin: "#edc3a1",
    hair: "#5c4536",
    suit: "#35444a",
  },
  energy: {
    name: "Dr. Maya Brooks",
    role: "Energy adviser",
    motive: "Keep the grid reliable and household bills affordable.",
    color: "#e5bf80",
    skin: "#905a3c",
    hair: "#25201d",
    suit: "#795849",
  },
  jensen: {
    name: "Jensen Huang",
    role: "NVIDIA CEO · dramatized",
    motive: "Preserve market access and American technology leadership.",
    color: "#bcdb9c",
    skin: "#d9a984",
    hair: "#a7a7a0",
    suit: "#202527",
  },
  security: {
    name: "Daniel Reyes",
    role: "National security adviser",
    motive: "Reduce diversion risk while keeping allies aligned.",
    color: "#b8c3e6",
    skin: "#ba8262",
    hair: "#302928",
    suit: "#30394a",
  },
  governor: {
    name: "Elena Ward",
    role: "Governor · fictional",
    motive:
      "Deliver jobs without making residents pay for someone else’s expansion.",
    color: "#d3b9db",
    skin: "#e3b18d",
    hair: "#5d3024",
    suit: "#604658",
  },
  press: {
    name: "Jordan Ellis",
    role: "White House correspondent · fictional",
    motive:
      "Find out whether the administration’s promises survived contact with reality.",
    color: "#a8cbd1",
    skin: "#82553c",
    hair: "#22201e",
    suit: "#465554",
  },
};
const choice = (id, title, detail, effects, flag, reaction, headline) => ({
  id,
  title,
  detail,
  effects,
  flag,
  reaction,
  headline,
});
export function hearing(state) {
  if (state.step === 0)
    return {
      id: "power",
      chapter: "01",
      week: 1,
      time: "09:00 AM",
      kicker: "Technology & energy",
      title: "Who powers the future?",
      visitors: ["sam", "energy"],
      lead: "sam",
      intro:
        "Mr. President, the next wave of AI needs electricity before it needs another announcement. Give us a dependable path to build, and we can commit. What terms will you put on the table?",
      context:
        "An AI infrastructure proposal has reached your desk. The investment is private; power, permits and public confidence are everyone’s problem.",
      questions: [
        {
          id: "cost",
          actor: "energy",
          label: "Who pays if the project fails?",
          text: "A promise does not cover an unfinished substation. Ask state regulators for enforceable cost agreements, financial security and exit fees. Strong conditions take longer to negotiate, but they can limit the bill left to households.",
        },
        {
          id: "speed",
          actor: "sam",
          label: "What does a slower approval cost?",
          text: "Financing and equipment reservations have deadlines. A phased build can work if the milestones are clear. An indefinite review makes it harder to commit capital here.",
        },
        {
          id: "authority",
          actor: "aide",
          label: "What can my office actually do?",
          text: "We can coordinate federal agencies and negotiate commitments. States and utility commissions still control many siting and rate decisions. You are setting an administration position, not signing away their authority.",
        },
      ],
      documents: [
        {
          title: "Energy desk · Risk assessment",
          body: "The bottleneck is available power at the right place and time. Separate generation, transmission, water and local permitting. A funded first phase can be more credible than a larger unfunded promise.",
          metrics: [
            ["Grid headroom", "Tight"],
            ["Cost exposure", "Negotiable"],
            ["Local consent", "Unresolved"],
          ],
        },
        {
          title: "Background · The public record",
          body: "The March 2026 pledge asks data-center companies to cover their energy and infrastructure costs. Stargate’s 2025 announcement illustrates the scale of intended AI investment. This meeting and its proposal are fictional.",
          metrics: [
            ["Evidence checked", pack.verifiedAt],
            ["Meeting", "Dramatized"],
            ["Outcome", "Yours to shape"],
          ],
        },
      ],
      choices: [
        choice(
          "fast",
          "Accelerate the build",
          "Fast-track federal coordination. Seek voluntary commitments on household costs.",
          { economy: 13, approval: 6, unrest: 5, morality: -3, global: 5 },
          "fast",
          "Sam leans forward. “We can move on that.” Brooks closes her folder: “Then we need a plan for the uncovered costs.”",
          "AI expansion gains momentum; energy safeguards remain voluntary",
        ),
        choice(
          "guard",
          "Negotiate a funded first phase",
          "Require cost guarantees and grid milestones before supporting expansion.",
          { economy: 5, approval: 3, unrest: -3, morality: 6, global: 1 },
          "guard",
          "Brooks nods. “Now we can put the obligations in writing.” Sam pauses: “Give us clear milestones, and we’ll take it to our partners.”",
          "Administration backs phased AI build with cost protections",
        ),
        choice(
          "pause",
          "Pause for a capacity review",
          "Hold federal support until agencies and states complete a joint review.",
          { economy: -6, approval: -2, unrest: -4, morality: 3, global: -4 },
          "pause",
          "Sam gathers his papers. “Our equipment orders cannot wait forever.” Brooks offers to bring the governors into the review.",
          "AI proposal delayed as White House orders grid review",
        ),
      ],
    };
  if (state.step === 1)
    return {
      id: "chips",
      chapter: "02",
      week: 3,
      time: "02:15 PM",
      kicker: "Trade & national security",
      title: "An open market. A closed door?",
      visitors: ["jensen", "security"],
      lead: "jensen",
      intro:
        "Mr. President, if American companies leave a market, other suppliers move in. I’m asking for a predictable path to limited sales. Your security team has concerns. Let’s hear them.",
      context:
        "A fictional chip-export negotiation inspired by the 2025 H20 debate. The question is how to weigh market influence against access to sensitive computing technology.",
      questions: [
        {
          id: "risk",
          actor: "security",
          label: "Can we verify the end users?",
          text: "We can request audits, end-use commitments and enforcement cooperation. None eliminates diversion. The question is what residual risk you will accept—and whether Commerce can verify the conditions.",
        },
        {
          id: "market",
          actor: "jensen",
          label: "What do restrictions cost us?",
          text: "Revenue is part of it. Developers learn a platform and build around it. If customers adopt a competing ecosystem, reopening a market later may not bring them back.",
        },
        {
          id: "allies",
          actor: "security",
          label: "Where do our allies fit?",
          text: "Unilateral limits can leave gaps. A coordinated review takes time but can align restrictions and enforcement. A decision today will shape the credibility of those talks.",
        },
      ],
      documents: [
        {
          title: "Security desk · Decision memo",
          body: "There is no zero-risk export policy. Licensing conditions need staff, verification and consequences for violations. An immediate restriction also has diplomatic and commercial effects.",
          metrics: [
            ["Diversion risk", "Persistent"],
            ["Verification", "Resource intensive"],
            ["Allied position", "Not settled"],
          ],
        },
        {
          title: "Historical context · H20",
          body: "In July 2025, NVIDIA said it was applying to resume H20 sales and had received assurances about licensing. This episode draws on that historical dispute; its choices do not describe current law.",
          metrics: [
            ["Source", "NVIDIA"],
            ["Record date", "14 July 2025"],
            ["Policy scene", "Fictional"],
          ],
        },
      ],
      choices: [
        choice(
          "limited",
          "Pursue tightly limited licenses",
          "Direct Commerce to assess restricted sales with end-user checks.",
          { economy: 8, global: -2, morality: 1, approval: 2, unrest: 2 },
          "limited",
          "Jensen nods. “A path forward matters.” Reyes replies: “Then verification has to be funded, not assumed.”",
          "Commerce asked to assess conditional chip-export licenses",
        ),
        choice(
          "restrict",
          "Back a restrictive position",
          "Prioritize limiting access to computing capabilities despite commercial costs.",
          { economy: -6, global: 4, morality: 2, approval: 1, unrest: 1 },
          "restrict",
          "Reyes gives a measured nod. Jensen steps back. “Our competitors will notice this opening.”",
          "White House prioritizes technology restrictions over export growth",
        ),
        choice(
          "coordinate",
          "Seek an allied review",
          "Delay a position while aligning verification and controls with partners.",
          { economy: -3, global: 7, morality: 3, approval: -2, unrest: 0 },
          "coordinate",
          "Reyes reaches for his phone. Jensen asks for a deadline. Both know the uncertainty will have a price.",
          "Allied chip-policy talks begin; industry awaits a timetable",
        ),
      ],
    };
  if (state.step === 2) {
    const path = state.flags.power;
    const branches = {
      fast: {
        intro:
          "Mr. President, you accelerated the project. Construction is moving—but the utility wants residents to cover part of the grid upgrade. People at my town hall are holding their bills. What do I tell them?",
        context:
          "Your first decision returns. Fast construction created jobs and an unresolved fight over infrastructure costs.",
        arrival: { approval: -7, unrest: 10, economy: 3 },
        headline:
          "Governor challenges household exposure in accelerated AI build",
        choices: [
          choice(
            "company",
            "Bring the companies back to the table",
            "Seek binding cost coverage with state regulators, accepting a construction slowdown.",
            { economy: -5, approval: 7, unrest: -9, morality: 7 },
            "company",
            "Ward exhales. “Give me terms I can enforce, and I’ll defend the project.” Brooks begins drafting the meeting agenda.",
            "White House reopens AI deal to negotiate household cost protection",
          ),
          choice(
            "public",
            "Seek federal transition funding",
            "Ask Congress to fund upgrades; preserve momentum but spend public money.",
            { economy: 5, approval: 1, unrest: -3, morality: -2 },
            "public",
            "Ward accepts the bridge, but asks who pays if Congress refuses. Your chief of staff starts counting votes.",
            "Administration seeks public funds for AI-related grid expansion",
          ),
          choice(
            "hold",
            "Stand by the original deal",
            "Defend the investment and leave the rate dispute to state proceedings.",
            { economy: 5, approval: -8, unrest: 10, morality: -6 },
            "hold",
            "Ward stands very still. “Then I will make our disagreement public.” Outside, the crowd grows louder.",
            "Governor breaks with White House over AI infrastructure costs",
          ),
        ],
      },
      guard: {
        intro:
          "Your cost guarantees kept the upgrade off household bills. But the first phase is behind schedule, and the company wants an exemption. I promised jobs. They are asking me when the gates open.",
        context:
          "Your negotiated safeguards held. Now the price is delay, and the pressure to waive your own conditions.",
        arrival: { approval: 3, unrest: -3, economy: -2 },
        headline:
          "Cost protections hold as AI project misses construction milestone",
        choices: [
          choice(
            "enforce",
            "Enforce the milestones",
            "Keep protections intact and negotiate a revised timetable.",
            { economy: -3, approval: 4, unrest: -4, morality: 6 },
            "enforce",
            "Ward nods slowly. “I can defend a delay if I can explain it.” Your adviser opens a revised schedule.",
            "White House holds AI developer to negotiated grid milestones",
          ),
          choice(
            "waive",
            "Allow a temporary waiver",
            "Accept more cost exposure to recover construction momentum.",
            { economy: 8, approval: -3, unrest: 6, morality: -5 },
            "waive",
            "Ward asks for the exemption’s end date in writing. Brooks warns that a temporary bill still has to be paid.",
            "Administration relaxes AI energy conditions to speed construction",
          ),
          choice(
            "smaller",
            "Fund a smaller opening phase",
            "Seek a limited public contribution and scale the opening to ready capacity.",
            { economy: 3, approval: 3, unrest: -2, morality: 1 },
            "smaller",
            "Ward sketches a smaller opening ceremony on your briefing. “Fewer jobs at first. But a date we can stand behind.”",
            "Smaller AI campus phase advances within available grid capacity",
          ),
        ],
      },
      pause: {
        intro:
          "The review found genuine limits, Mr. President. It also took long enough that the developer reserved equipment elsewhere. Residents are relieved about their bills. Workers want to know where the jobs went.",
        context:
          "Your review reduced immediate grid exposure but put the investment at risk. The governor wants a decision, not another study.",
        arrival: { economy: -4, approval: -3, unrest: 3 },
        headline:
          "AI developer reconsiders investment after extended capacity review",
        choices: [
          choice(
            "pilot",
            "Offer a smaller, protected pilot",
            "Use the review to negotiate a limited project with funded power.",
            { economy: 6, approval: 4, unrest: -3, morality: 3 },
            "pilot",
            "Ward reaches for the phone. “A smaller project is still a project. Let’s see if the developer will return.”",
            "Governor and White House pursue smaller AI investment",
          ),
          choice(
            "incentive",
            "Offer incentives to recover the deal",
            "Seek public support to make the original scale attractive again.",
            { economy: 9, approval: 1, unrest: 4, morality: -4 },
            "incentive",
            "Your chief of staff begins a budget request. Ward agrees to call the developer, but makes no promise about the answer.",
            "White House proposes incentives to revive stalled AI development",
          ),
          choice(
            "decline",
            "Let this proposal go",
            "Prioritize other investment and explain why this project did not fit.",
            { economy: -4, approval: -2, unrest: -2, morality: 4, global: -2 },
            "decline",
            "Ward closes the proposal. “Then help us find what comes next.” The office is quiet after she leaves.",
            "Administration ends support for stalled AI proposal",
          ),
        ],
      },
    };
    const b = branches[path];
    return {
      id: "governor",
      chapter: "03",
      week: 10,
      time: "04:40 PM",
      kicker: "A decision returns",
      title:
        path === "guard"
          ? "The promise comes due."
          : path === "pause"
            ? "The cost of waiting."
            : "The bill arrives.",
      visitors: ["governor", "energy"],
      lead: "governor",
      ...b,
      questions: [
        {
          id: "remember",
          actor: "aide",
          label: "Remind me what we committed to.",
          text: `Your first directive: ${state.history[0].title}. This visit follows directly from that choice. The chip decision also remains on the record.`,
        },
        {
          id: "local",
          actor: "governor",
          label: "What do your residents need now?",
          text: "A bill they can afford, a timeline they can believe and someone who answers questions. If your administration changes the terms, explain it before we read it in the press.",
        },
        {
          id: "tradeoff",
          actor: "energy",
          label: "Can we solve everything at once?",
          text: "No. More capacity takes time. Public money has other uses. Developer guarantees can reduce household exposure but cannot promise construction on schedule. Decide which risk you are prepared to own.",
        },
      ],
      documents: [
        {
          title: "Your desk · Earlier directive",
          body: state.history[0].detail,
          metrics: [
            ["Directive", state.history[0].title],
            ["Issued", "Week 1"],
            ["Follow-up", "Week 10"],
          ],
        },
        {
          title: "Governor’s office · Local response",
          body: b.context,
          metrics: [
            ["Approval", `${state.stats.approval}/100`],
            ["Civil unrest", `${state.stats.unrest}/100`],
            ["Economy", `${state.stats.economy}/100`],
          ],
        },
      ],
    };
  }
  if (state.step === 3)
    return {
      id: "accountability",
      chapter: "04",
      week: 12,
      time: "11:30 AM",
      kicker: "The public record",
      title: "What will you tell them?",
      visitors: ["press", "aide"],
      lead: "press",
      intro:
        "Mr. President, you made a promise about AI, made a choice on chips, and heard from a governor who had to live with your policy. What should the public hold you accountable for?",
      context: `Your latest directive: ${state.history[2].title}. The press is asking you to reconcile the promises with the results.`,
      questions: [
        {
          id: "record",
          actor: "aide",
          label: "What does our record actually show?",
          text:
            state.history.map((h) => h.title).join(". ") +
            ". These are the choices we can defend. None guarantees what happens next.",
        },
        {
          id: "ask",
          actor: "press",
          label: "What answer would count as accountability?",
          text: "Name the tradeoff. Publish what can be checked. Tell people when they can expect an update—and give them the numbers even if they are bad.",
        },
      ],
      documents: [
        {
          title: "Presidential record · Three directives",
          body: state.history
            .map((h, i) => `${i + 1}. ${h.title}: ${h.detail}`)
            .join("\n\n"),
          metrics: [
            ["Hearings completed", "3"],
            ["Decisions remembered", "All"],
            ["Next", "Public response"],
          ],
        },
      ],
      choices: [
        choice(
          "publish",
          "Publish the record and the tradeoffs",
          "Commit to public milestones, cost reporting and a follow-up briefing.",
          { morality: 7, approval: 3, unrest: -3, global: 2 },
          "publish",
          "Ellis looks up from the notebook. “We’ll be there for the next update.” Your chief of staff writes down the date.",
          "White House commits to public AI policy scorecard",
        ),
        choice(
          "sell",
          "Lead with the growth story",
          "Emphasize investment and technological leadership; leave disputes to the agencies.",
          { economy: 3, approval: 5, unrest: 3, morality: -4 },
          "sell",
          "Your chief of staff sees a clean headline. Ellis asks a second time about the costs. The cameras keep rolling.",
          "President champions AI growth as questions about costs persist",
        ),
        choice(
          "share",
          "Convene governors and industry publicly",
          "Share the platform and negotiate the next steps in the open.",
          { economy: -2, approval: 2, morality: 4, global: 3, unrest: -2 },
          "share",
          "Ellis asks whether dissenting governors will be invited. “All of them,” your chief of staff confirms.",
          "White House announces public meeting with governors and AI industry",
        ),
      ],
    };
  return null;
}
