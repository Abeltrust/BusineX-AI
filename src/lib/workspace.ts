import type { LeadStage, TaskStatus, BusinessStage } from '../types';

export const stageLabel: Record<BusinessStage, string> = {
  idea: 'Idea',
  mvp: 'Validation',
  traction: 'Traction',
  scale: 'Scale',
};

export const taskColumns: TaskStatus[] = ['backlog', 'in_progress', 'done'];
export const leadStages: LeadStage[] = ['new', 'contacted', 'proposal', 'won'];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export const createId = () => Math.random().toString(36).slice(2, 10);
