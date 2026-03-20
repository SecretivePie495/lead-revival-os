import type { Sequence } from "@/lib/types/playbooks";

export const MOCK_SEQUENCES_INITIAL: Sequence[] = [
  {
    id: "seq-1",
    name: "7-Day Wake Up",
    templateId: "tpl-1",
    templateName: "7-Day Wake Up",
    clientId: null,
    clientName: null,
    status: "Active",
    lastUpdated: new Date().toISOString(),
    targetingSummary: "Dormant 90–365 days · 8,120 leads",
    steps: [
      {
        id: "step-1",
        dayOffset: 0,
        message: "Hi {{name}}, we noticed you inquired about {{service}}...",
        order: 0,
      },
      {
        id: "step-2",
        dayOffset: 2,
        message: "Quick check-in — still interested?",
        order: 1,
      },
    ],
    logicToggles: {
      stopOnReply: true,
      unsubscribeOnStop: true,
      markQualifiedOnRequiredAnswers: false,
    },
  },
  {
    id: "seq-2",
    name: "No-Show Reactivation",
    templateId: "tpl-2",
    templateName: "No-Show Reactivation",
    clientId: "c1",
    clientName: "Phoenix Solar & Home",
    status: "Paused",
    lastUpdated: new Date().toISOString(),
    steps: [
      {
        id: "step-3",
        dayOffset: 0,
        message: "We missed you at your scheduled call today...",
        order: 0,
      },
    ],
    logicToggles: {
      stopOnReply: true,
      unsubscribeOnStop: true,
      markQualifiedOnRequiredAnswers: false,
    },
  },
];
