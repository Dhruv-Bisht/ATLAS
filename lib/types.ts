export type OpportunityType = 'JOB' | 'INTERNSHIP' | 'SCHOLARSHIP';
export type Opportunity = {
  id: string; title: string; type: OpportunityType; organization: string; description: string;
  field?: string | null; country: string; region?: string | null; city?: string | null;
  latitude: number; longitude: number; workMode?: string | null; experienceRequired?: string | null;
  salary?: string | null; currency?: string | null; eligibility?: string | null; deadline: string;
  applicationUrl: string; sourceUrl?: string | null; sourceName: string; verified: boolean;
};
