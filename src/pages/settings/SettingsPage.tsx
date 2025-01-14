import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Palette, 
  Mail, 
  Phone, 
  MessageSquare, 
  Globe, 
  Save,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  getOrganizationSettings, 
  updateOrganizationSettings,
  getIntegrationSettings,
  updateIntegrationSettings
} from '../../lib/settings';
import type { OrganizationSettings, IntegrationSettings } from '../../types/settings';

export const SettingsPage = () => {
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings | null>(null);
  const [intSettings, setIntSettings] = useState<IntegrationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [org, int] = await Promise.all([
          getOrganizationSettings(),
          getIntegrationSettings()
        ]);
        setOrgSettings(org || defaultOrgSettings);
        setIntSettings(int || defaultIntSettings);
      } catch (err) {
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleOrgSettingsChange = (field: keyof OrganizationSettings, value: string) => {
    setOrgSettings(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleIntegrationToggle = (integration: 'whatsapp' | 'email') => {
    setIntSettings(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [integration]: {
          ...prev[integration],
          enabled: !prev[integration].enabled
        }
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await Promise.all([
        updateOrganizationSettings(orgSettings!),
        updateIntegrationSettings(intSettings!)
      ]);
      setSuccess('Settings saved successfully');
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-alexandria font-semibold text-gray-800">
          Settings
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-secondary text-white px-4 py-2 rounded-1deg flex items-center gap-2 hover:bg-secondary/90 disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-1deg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-1deg p-4 flex items-center gap-3">
          <CheckCircle2 className="text-green-500" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Organization Settings */}
      <div className="bg-white rounded-1deg border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-alexandria font-semibold text-gray-800 mb-6">
            Organization Information
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={orgSettings?.name || ''}
                  onChange={(e) => handleOrgSettingsChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="url"
                  value={orgSettings?.website || ''}
                  onChange={(e) => handleOrgSettingsChange('website', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="relative">
                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="color"
                  value={orgSettings?.primaryColor || '#FFEE00'}
                  onChange={(e) => handleOrgSettingsChange('primaryColor', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 h-10 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="relative">
                <Palette className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="color"
                  value={orgSettings?.secondaryColor || '#223F7F'}
                  onChange={(e) => handleOrgSettingsChange('secondaryColor', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 h-10 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={orgSettings?.description || ''}
                onChange={(e) => handleOrgSettingsChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
                Contact Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={orgSettings?.contactEmail || ''}
                  onChange={(e) => handleOrgSettingsChange('contactEmail', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  value={orgSettings?.contactPhone || ''}
                  onChange={(e) => handleOrgSettingsChange('contactPhone', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Integration */}
      <div className="bg-white rounded-1deg border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-alexandria font-semibold text-gray-800">
              WhatsApp Integration
            </h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={intSettings?.whatsapp.enabled}
                onChange={() => handleIntegrationToggle('whatsapp')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
            </label>
          </div>

          <div className={intSettings?.whatsapp.enabled ? 'space-y-6' : 'space-y-6 opacity-50 pointer-events-none'}>
            <div>
              <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
                WhatsApp API Key
              </label>
              <input
                type="password"
                value={intSettings?.whatsapp.apiKey || ''}
                onChange={(e) => setIntSettings(prev => ({
                  ...prev!,
                  whatsapp: {
                    ...prev!.whatsapp,
                    apiKey: e.target.value
                  }
                }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="tel"
                  value={orgSettings?.whatsappNumber || ''}
                  onChange={(e) => handleOrgSettingsChange('whatsappNumber', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                  placeholder="+1234567890"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-alexandria font-medium text-gray-700">
                Message Templates
              </h3>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Seal Issued</label>
                <textarea
                  value={intSettings?.whatsapp.templateMessages.sealIssued || ''}
                  onChange={(e) => setIntSettings(prev => ({
                    ...prev!,
                    whatsapp: {
                      ...prev!.whatsapp,
                      templateMessages: {
                        ...prev!.whatsapp.templateMessages,
                        sealIssued: e.target.value
                      }
                    }
                  }))}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                  placeholder="Use {{seal_id}}, {{station}}, etc. as variables"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Seal Damaged</label>
                <textarea
                  value={intSettings?.whatsapp.templateMessages.sealDamaged || ''}
                  onChange={(e) => setIntSettings(prev => ({
                    ...prev!,
                    whatsapp: {
                      ...prev!.whatsapp,
                      templateMessages: {
                        ...prev!.whatsapp.templateMessages,
                        sealDamaged: e.target.value
                      }
                    }
                  }))}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                  placeholder="Use {{seal_id}}, {{station}}, etc. as variables"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Seal Received</label>
                <textarea
                  value={intSettings?.whatsapp.templateMessages.sealReceived || ''}
                  onChange={(e) => setIntSettings(prev => ({
                    ...prev!,
                    whatsapp: {
                      ...prev!.whatsapp,
                      templateMessages: {
                        ...prev!.whatsapp.templateMessages,
                        sealReceived: e.target.value
                      }
                    }
                  }))}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                  placeholder="Use {{seal_id}}, {{station}}, etc. as variables"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Integration */}
      <div className="bg-white rounded-1deg border border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-alexandria font-semibold text-gray-800">
              Email Integration
            </h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={intSettings?.email.enabled}
                onChange={() => handleIntegrationToggle('email')}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
            </label>
          </div>

          <div className={intSettings?.email.enabled ? 'space-y-6' : 'space-y-6 opacity-50 pointer-events-none'}>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
                  Email Provider
                </label>
                <select
                  value={intSettings?.email.provider}
                  onChange={(e) => setIntSettings(prev => ({
                    ...prev!,
                    email: {
                      ...prev!.email,
                      provider: e.target.value as 'smtp' | 'sendgrid'
                    }
                  }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                >
                  <option value="smtp">SMTP</option>
                  <option value="sendgrid">SendGrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={intSettings?.email.apiKey || ''}
                  onChange={(e) => setIntSettings(prev => ({
                    ...prev!,
                    email: {
                      ...prev!.email,
                      apiKey: e.target.value
                    }
                  }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  value={intSettings?.email.fromEmail || ''}
                  onChange={(e) => setIntSettings(prev => ({
                    ...prev!,
                    email: {
                      ...prev!.email,
                      fromEmail: e.target.value
                    }
                  }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                />
              </div>

              <div>
                <label className="block text-sm font-alexandria font-medium text-gray-700 mb-2">
                  From Name
                </label>
                <input
                  type="text"
                  value={intSettings?.email.fromName || ''}
                  onChange={(e) => setIntSettings(prev => ({
                    ...prev!,
                    email: {
                      ...prev!.email,
                      fromName: e.target.value
                    }
                  }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-alexandria font-medium text-gray-700">
                Email Templates
              </h3>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Seal Issued</label>
                <textarea
                  value={intSettings?.email.templates.sealIssued || ''}
                  onChange={(e) => setIntSettings(prev => ({
                    ...prev!,
                    email: {
                      ...prev!.email,
                      templates: {
                        ...prev!.email.templates,
                        sealIssued: e.target.value
                      }
                    }
                  }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                  placeholder="Use {{seal_id}}, {{station}}, etc. as variables"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Seal Damaged</label>
                <textarea
                  value={intSettings?.email.templates.sealDamaged || ''}
                  onChange={(e) => setIntSettings(prev => ({
                    ...prev!,
                    email: {
                      ...prev!.email,
                      templates: {
                        ...prev!.email.templates,
                        sealDamaged: e.target.value
                      }
                    }
                  }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                  placeholder="Use {{seal_id}}, {{station}}, etc. as variables"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Seal Received</label>
                <textarea
                  value={intSettings?.email.templates.sealReceived || ''}
                  onChange={(e) => setIntSettings(prev => ({
                    ...prev!,
                    email: {
                      ...prev!.email,
                      templates: {
                        ...prev!.email.templates,
                        sealReceived: e.target.value
                      }
                    }
                  }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-1deg focus:outline-none focus:border-secondary"
                  placeholder="Use {{seal_id}}, {{station}}, etc. as variables"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const defaultOrgSettings: OrganizationSettings = {
  name: '',
  logo: '',
  primaryColor: '#FFEE00',
  secondaryColor: '#223F7F',
  contactEmail: '',
  contactPhone: '',
  whatsappNumber: '',
  address: '',
  website: '',
  description: ''
};

const defaultIntSettings: IntegrationSettings = {
  whatsapp: {
    enabled: false,
    apiKey: '',
    templateMessages: {
      sealIssued: '',
      sealDamaged: '',
      sealReceived: ''
    }
  },
  email: {
    enabled: false,
    provider: 'smtp',
    apiKey: '',
    fromEmail: '',
    fromName: '',
    templates: {
      sealIssued: '',
      sealDamaged: '',
      sealReceived: ''
    }
  }
};