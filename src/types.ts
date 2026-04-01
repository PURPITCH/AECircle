export interface Profile {
  name: string;
  designation: string;
  picture: string;
  date_of_birth: string;
  nationality: string;
  resident_status: string;
  sex: 'Male' | 'Female' | 'Other';
  height: number;
  weight: number;
  medical_conditions: string[];
  basic_training: string[];
  licenses: Array<{
    type: string;
    issuingAuthority: string;
  }>;
  certifying_experience: Array<{
    type: 'line' | 'base' | 'workshop' | 'techPub' | 'planning' | 'quality' | 'safety';
    description: string;
    duration: string;
  }>;
  non_certifying_experience: Array<{
    type: 'line' | 'base' | 'workshop' | 'techPub' | 'planning' | 'quality' | 'safety';
    description: string;
    duration: string;
  }>;
  drivers_license: {
    number: string;
    issuingCountry: string;
    vehicleType?: string;
  };
  continuous_training: string[];
  company_training: string[];
  has_tool_box: boolean;
  other_training: string[];
}