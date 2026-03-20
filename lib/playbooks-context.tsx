"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { PlaybookTemplate, Sequence, Step } from "./types/playbooks";
import { MOCK_TEMPLATES } from "./mock/playbook-templates";
import { MOCK_SEQUENCES_INITIAL } from "./mock/sequences";

type PlaybooksContextValue = {
  templates: PlaybookTemplate[];
  sequences: Sequence[];
  addTemplate: (t: Omit<PlaybookTemplate, "id">) => void;
  addSequence: (s: Omit<Sequence, "id" | "lastUpdated">) => Sequence;
  updateSequence: (id: string, updates: Partial<Sequence>) => void;
  getSequence: (id: string) => Sequence | undefined;
  createSequenceFromTemplate: (
    templateId: string,
    name: string,
    clientId?: string
  ) => Sequence;
};

const PlaybooksContext = createContext<PlaybooksContextValue | null>(null);

export function PlaybooksProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<PlaybookTemplate[]>(MOCK_TEMPLATES);
  const [sequences, setSequences] = useState<Sequence[]>(MOCK_SEQUENCES_INITIAL);

  const addTemplate = useCallback((t: Omit<PlaybookTemplate, "id">) => {
    const newTemplate: PlaybookTemplate = {
      ...t,
      id: `tpl-${Date.now()}`,
    };
    setTemplates((prev) => [...prev, newTemplate]);
  }, []);

  const createSequenceFromTemplate = useCallback(
    (templateId: string, name: string, clientId?: string): Sequence => {
      const template = templates.find((t) => t.id === templateId);
      const steps: Step[] = (template?.exampleSteps ?? []).map((s, i) => ({
        id: `step-${Date.now()}-${i}`,
        dayOffset: s.day,
        message: s.message,
        order: i,
      }));
      const newSeq: Sequence = {
        id: `seq-${Date.now()}`,
        name,
        templateId,
        templateName: template?.name ?? null,
        clientId: clientId ?? null,
        clientName: null,
        status: "Draft",
        lastUpdated: new Date().toISOString(),
        steps,
        logicToggles: {
          stopOnReply: true,
          unsubscribeOnStop: true,
          markQualifiedOnRequiredAnswers: false,
        },
      };
      setSequences((prev) => [...prev, newSeq]);
      return newSeq;
    },
    [templates]
  );

  const addSequence = useCallback(
    (s: Omit<Sequence, "id" | "lastUpdated">): Sequence => {
      const newSeq: Sequence = {
        ...s,
        id: `seq-${Date.now()}`,
        lastUpdated: new Date().toISOString(),
      };
      setSequences((prev) => [...prev, newSeq]);
      return newSeq;
    },
    []
  );

  const updateSequence = useCallback((id: string, updates: Partial<Sequence>) => {
    setSequences((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const getSequence = useCallback(
    (id: string) => sequences.find((s) => s.id === id),
    [sequences]
  );

  return (
    <PlaybooksContext.Provider
      value={{
        templates,
        sequences,
        addTemplate,
        addSequence,
        updateSequence,
        getSequence,
        createSequenceFromTemplate,
      }}
    >
      {children}
    </PlaybooksContext.Provider>
  );
}

export function usePlaybooks() {
  const ctx = useContext(PlaybooksContext);
  if (!ctx) throw new Error("usePlaybooks must be used within PlaybooksProvider");
  return ctx;
}
