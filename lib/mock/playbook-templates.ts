import type { PlaybookTemplate } from "@/lib/types/playbooks";

export const MOCK_TEMPLATES: PlaybookTemplate[] = [
  {
    id: "tpl-1",
    name: "7-Day Wake Up",
    description:
      "Re-engage dormant leads who haven't responded in 90+ days. Gentle, spaced follow-ups designed to restart the conversation.",
    tags: ["Revival", "Wake Up"],
    builtFor: "Dormant leads 90–365 days · FB & Google leads",
    exampleSteps: [
      { day: 0, message: "Hi {{name}}, we noticed you inquired about {{service}}..." },
      { day: 2, message: "Quick check-in — still interested in learning more?" },
      { day: 5, message: "Last outreach. If timing isn't right, no worries." },
    ],
  },
  {
    id: "tpl-2",
    name: "No-Show Reactivation",
    description:
      "Follow up with leads who booked but didn't show. Rebook missed calls within 14 days.",
    tags: ["No-Show"],
    builtFor: "Missed appointments · rebooks within 14 days",
    exampleSteps: [
      { day: 0, message: "We missed you at your scheduled call today..." },
      { day: 1, message: "Reschedule when it works for you." },
      { day: 7, message: "Final reminder to rebook your call." },
    ],
  },
  {
    id: "tpl-3",
    name: "Nurture Drip",
    description:
      "Long-term nurture for warm leads. Keeps you top of mind with value-add messages.",
    tags: ["Nurture"],
    builtFor: "Warm leads · not ready to book yet",
    exampleSteps: [
      { day: 0, message: "Here's a helpful resource on {{service}}..." },
      { day: 7, message: "Thought you might find this useful." },
      { day: 14, message: "Checking in — any questions?" },
    ],
  },
];
