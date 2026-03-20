export type TemplateTag = "Revival" | "No-Show" | "Nurture" | "Wake Up" | string;

export type PlaybookTemplate = {
  id: string;
  name: string;
  description: string;
  tags: TemplateTag[];
  exampleSteps?: { day: number; message: string }[];
  builtFor?: string;
};

export type SequenceStatus = "Draft" | "Active" | "Paused" | "Archived";

export type Step = {
  id: string;
  dayOffset: number;
  message: string;
  timeWindow?: string;
  order: number;
};

export type LogicToggles = {
  stopOnReply: boolean;
  unsubscribeOnStop: boolean;
  markQualifiedOnRequiredAnswers: boolean;
};

export type Sequence = {
  id: string;
  name: string;
  templateId?: string | null;
  templateName?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  status: SequenceStatus;
  lastUpdated: string;
  steps: Step[];
  logicToggles: LogicToggles;
  targetingSummary?: string;
};
