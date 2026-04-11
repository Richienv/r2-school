export type AssignmentType =
  | "GROUP_PRESENTATION"
  | "INDIVIDUAL_PRESENTATION"
  | "HOMEWORK"
  | "INDIVIDUAL_PROJECT"
  | "MIDTERM"
  | "FINAL";

export type AssignmentStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "DONE";

export interface Course {
  id: string;
  name: string;
  shortName: string;
  professor: string;
  color: string;
  active: boolean;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  type: AssignmentType;
  dueDate: string;
  status: AssignmentStatus;
  description?: string;
  groupMembers?: string[];
  notes?: string;
  checklist?: ChecklistItem[];
  progress?: number;
  createdAt: string;
}

export interface ClassNote {
  id: string;
  courseId: string;
  date: string;
  rawContent: string;
  aiSummary: string;
  keyPoints: string[];
  examTopics?: string[];
  createdAt: string;
}
