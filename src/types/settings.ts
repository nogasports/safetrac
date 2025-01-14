export interface OrganizationSettings {
  name: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  address: string;
  website: string;
  description: string;
}

export interface IntegrationSettings {
  whatsapp: {
    enabled: boolean;
    apiKey: string;
    templateMessages: {
      sealIssued: string;
      sealDamaged: string;
      sealReceived: string;
    };
  };
  email: {
    enabled: boolean;
    provider: 'smtp' | 'sendgrid';
    apiKey: string;
    fromEmail: string;
    fromName: string;
    templates: {
      sealIssued: string;
      sealDamaged: string;
      sealReceived: string;
    };
  };
}