import { FILLOUT_QUESTION_TYPES } from "./constants.js";

export type FilloutForm = {
  id: string;
  name: string;
  questions: FilloutQuestion[];
  calculations: FilloutCalculation[];
  urlParameters: { id: string; name: string }[];
  documents: { id: string; name: string }[];
  scheduling: { id: string; name: string }[];
  payments: { id: string; name: string }[];
  approvals?: FilloutApproval[];
};

export type FilloutFormTag = "form" | "quiz" | "survey" | "scheduling";

type FilloutQuestion = {
  id: string;
  name: string;
  type: FilloutQuestionType;
  options?: FilloutOption[];
};

type FilloutQuestionType = (typeof FILLOUT_QUESTION_TYPES)[number];

type FilloutOption = {
  id: string;
  value: string;
  label: string;
};

type FilloutCalculation = {
  id: string;
  name: string;
  type: FilloutCalculationType;
};

type FilloutCalculationType = "text" | "number" | "duration";

type FilloutApproval = {
  workflowId: string;
  nodeId: string;
  approvers: { userId: number }[];
  states: FilloutApprovalState[];
  inputFields: FilloutApprovalInputField[];
};

type FilloutApprovalState = {
  id: string;
  name: string;
  color: string;
  nextNodeId: string | undefined;
};

type FilloutApprovalInputField = {
  customFieldId: string;
  label: string;
  required: boolean;
  showForStates: {
    type: "all" | "custom";
    customStateIds: string[];
  };
};

export type FilloutSubmission = {
  submissionId: string;
  submissionTime: string;
  lastUpdatedAt: string;
  startedAt?: string;
  questions: {
    id: string;
    name: string;
    type: FilloutQuestionType;
    value: any; // TODO
  }[];
  calculations: {
    id: string;
    name: string;
    type: FilloutCalculationType;
    value: string | number | null;
  }[];
  quiz:
    | {
        score: number | undefined;
        maxScore: number | undefined;
      }
    | Record<string, never>;
  documents: {
    id: string;
    name: string;
    url: string;
  }[];
  scheduling: {
    id: string;
    name: string;
    value: FilloutSchedulingValue | null;
  }[];
  payments: {
    id: string;
    name: string;
    value: FilloutPaymentValue | null;
  }[];
  urlParameters: {
    id: string;
    name: string;
    value: string | null;
  }[];
  approvals?: FilloutApprovalModel[];
  editLink: string | undefined;
  login?: {
    email: string;
  };
};

type FilloutSchedulingValue = {
  fullName: string;
  email: string;
  phone: string;
  timezone: string;
  eventStartTime: string;
  eventEndTime: string;
  eventId: string;
  eventUrl: string;
  rescheduleOrCancelUrl?: string;
  scheduledUserEmail?: string;
};

type FilloutPaymentValue = {
  discountCount: string | undefined;
  stripeCustomerId: string | undefined;
  stripeCustomerUrl: string | undefined;
  stripePaymentUrl: string | undefined;
  totalAmount: number | undefined;
  currency: string | undefined;
  email: string | undefined;
  payment: string | undefined;
  status: FilloutPaymentStatus;
  stripeSubscriptionId: string | undefined;
};

type FilloutPaymentStatus =
  | "requires_payment_method"
  | "requires_confirmation"
  | "requires_action"
  | "processing"
  | "requires_capture"
  | "canceled"
  | "succeeded"
  | ""
  | "succeeded_free"
  | "trial_created";

type FilloutApprovalModel = {
  workflowId: string;
  workflowRunId: string;
  nodeId: string;
  decisions: FilloutApprovalDecision[];
  finalStateId: string | undefined;
};

type FilloutApprovalDecision = {
  userId: number;
  selectedStateId: string;
  name: string;
  color: string;
  createdAt: string;
};
