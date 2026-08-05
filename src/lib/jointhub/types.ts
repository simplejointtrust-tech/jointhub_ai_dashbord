/** Shared types for JointHub Africa Capstone II dashboard. */

export type InterestTag =
  | "creative_tech"
  | "entrepreneurship"
  | "data_ai"
  | "design_ux"
  | "social_impact"
  | "media_film"
  | "music_arts"
  | "climate_env"
  | "health"
  | "leadership"
  | "finance"
  | "agri_food";

export type Role = "student" | "admin";

export type AuthUser = {
  email: string;
  role: Role;
  student_id: string | null;
  full_name: string;
};

export type StudentProfile = {
  student_id: string;
  full_name: string;
  email: string;
  country: string;
  campus: string;
  programme: string;
  career_stage: number;
  leader_status: boolean;
  interest_tags: string[];
  career_goal_text: string;
  signup_timestamp: string;
  heard_channel: string;
  interest_vector: number[];
  skills_needed: string[];
  languages: string[];
};

export type MentorProfile = {
  mentor_id: string;
  name: string;
  country: string;
  industry: string;
  skills_offered: string[];
  skills_vector: number[];
  career_stage_mentor: number;
  availability_hrs_per_month: number;
  languages: string[];
  title?: string;
  bio?: string;
  /** Optional portrait path shared with the public ESL Mentors page */
  image?: string;
  linkedInUrl?: string;
};

export type OpportunityListing = {
  opp_id: string;
  title: string;
  type: string;
  org_name: string;
  eligible_countries: string[];
  eligible_fields: string[];
  eligible_career_stages: number[];
  deadline: string;
  interest_vector: number[];
  description: string;
  description_embedding: number[];
  is_verified: boolean;
  is_scam_flag: boolean;
  created_at: string;
};

export type Recommendation = {
  opp_id: string;
  title: string;
  org_name: string;
  type: string;
  deadline: string;
  match_score: number;
  is_verified: boolean;
  is_scam_flag?: boolean;
  description?: string;
  interest_overlap?: string[];
};

export type MentorAssignment = {
  student_id: string;
  student_name: string;
  mentor_id: string;
  mentor_name: string;
  mentor_title?: string;
  mentor_industry: string;
  mentor_country: string;
  compatibility: number;
  languages?: string[];
};

export type MentorTop3 = {
  mentor_id: string;
  mentor_name: string;
  title?: string;
  industry: string;
  country: string;
  score: number;
  skills_offered?: string[];
  availability_hrs_per_month: number;
};

export type SessionLog = {
  session_id: string;
  student_id: string;
  mentor_id: string;
  session_date: string;
  session_duration_mins: number;
  topics_discussed: string[];
  student_rating: number;
  goals_set: boolean;
  days_since_last_session: number;
  status?: "completed" | "scheduled" | "logged";
};

export type RiskRow = {
  student_id: string;
  full_name: string;
  email: string;
  country: string;
  risk_probability: number;
  at_risk: boolean;
  risk_level: "low" | "medium" | "high";
  top_risk_factor: string;
  features: {
    days_since_last_login: number;
    gpa_score: number;
    attendance_rate: number;
    days_since_last_mentor_session: number;
    profile_completeness: number;
  };
  outreach_prompt: string;
  outreach_triggered?: boolean;
};

export type NlpRow = {
  student_id: string;
  full_name: string;
  career_goal_text: string;
  entities: {
    ORG: string[];
    SKILL: string[];
    GPE: string[];
    PRODUCT: string[];
  };
  top_tags: string[];
  recommendation_sentence: string;
  best_opp_id?: string | null;
  best_score?: number;
  pipeline?: Record<string, string>;
};

export type PlatformKpis = {
  registered_users: number;
  opportunities_matched: number;
  active_mentor_pairs: number;
  at_risk_students_flagged: number;
  nps_proxy: number;
  scam_flags: number;
  impact: {
    scholarships_usd: number;
    students_supported: number;
    countries: number;
  };
};

export type ModelMetrics = {
  recommendation_precision_at_5: number;
  recommendation_target: number;
  mentor_match_f1: number;
  mentor_match_target: number;
  dropout_auc_roc: number;
  dropout_target: number;
  nlp_entity_recall_estimate: number;
  nlp_target: number;
  logistic_coefficients: Record<string, number>;
  random_forest_feature_importance: Record<string, number>;
  notes: Record<string, string>;
};

export type MentorshipPayload = {
  assignments: MentorAssignment[];
  top3: Record<string, MentorTop3[]>;
  heatmap: {
    student_ids: string[];
    student_names: string[];
    mentor_ids: string[];
    mentor_names: string[];
    matrix: number[][];
  };
  sessions: SessionLog[];
  mentors: MentorProfile[];
};

export type DashboardBundle = {
  student: StudentProfile | null;
  kpis: PlatformKpis;
  metrics: ModelMetrics;
  recommendations: Recommendation[];
  mentorship: MentorshipPayload;
  risk: RiskRow[];
  nlp: NlpRow[];
  role: Role;
  auth_email: string;
  personalised_sentence: string | null;
};
