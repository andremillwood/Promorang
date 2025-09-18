import { useState, useEffect } from 'react';
import { X, CreditCard, Building, Mail, Trash2, Star, Plus, Edit3 } from 'lucide-react';
import { UserType, UserPaymentPreferenceType, WithdrawalMethodType } from '@/shared/types';

interface PaymentPreferencesModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentPreferencesModal({ user, isOpen, onClose, onSuccess }: PaymentPreferencesModalProps) {
  const [userPreferences, setUserPreferences] = useState<UserPaymentPreferenceType[]>([]);
  const [withdrawalMethods, setWithdrawalMethods] = useState<WithdrawalMethodType[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentDetails, setPaymentDetails] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [preferencesResponse, methodsResponse] = await Promise.all([
        fetch('/api/users/payment-preferences', { credentials: 'include' }),
        fetch('/api/withdrawal/methods', { credentials: 'include' })
      ]);

      const preferences = await preferencesResponse.json();
      const methods = await methodsResponse.json();

      setUserPreferences(preferences);
      setWithdrawalMethods(methods);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  if (!isOpen || !user) return null;

  const getMethodIcon = (method: string) => {
    if (method.startsWith('crypto_')) return <CreditCard className="w-5 h-5" />;
    if (method === 'bank_account') return <Building className="w-5 h-5" />;
    if (method === 'paypal' || method === 'payoneer') return <Mail className="w-5 h-5" />;
    return <CreditCard className="w-5 h-5" />;
  };

  const getRequiredFields = (method: string): string[] => {
    const methodData = withdrawalMethods.find(m => m.method_name === method);
    if (!methodData) return [];
    try {
      return JSON.parse(methodData.required_fields);
    } catch {
      return [];
    }
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      wallet_address: 'Wallet Address',
      network: 'Network',
      email_address: 'Email Address',
      account_holder_name: 'Account Holder Name',
      bank_name: 'Bank Name',
      account_number: 'Account Number',
      routing_number: 'Routing Number',
      swift_code: 'SWIFT Code',
      country: 'Country',
      full_name: 'Full Name',
      address_line_1: 'Address Line 1',
      address_line_2: 'Address Line 2',
      city: 'City',
      state: 'State/Province',
      postal_code: 'Postal Code',
      phone_number: 'Phone Number'
    };
    return labels[field] || field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDisplayInfo = (preference: UserPaymentPreferenceType) => {
    try {
      const data = JSON.parse(preference.preference_data);
      if (data.email_address) return data.email_address;
      if (data.wallet_address) return `${data.wallet_address.slice(0, 8)}...${data.wallet_address.slice(-6)}`;
      if (data.account_number) return `****${data.account_number.slice(-4)}`;
      if (data.full_name) return data.full_name;
      return 'Payment method';
    } catch {
      return 'Payment method';
    }
  };

  const handleSavePreference = async () => {
    if (!selectedMethod || Object.keys(paymentDetails).length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/users/payment-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          payment_method: selectedMethod,
          preference_data: paymentDetails,
          is_default: userPreferences.length === 0 // First one becomes default
        })
      });

      if (response.ok) {
        await fetchData();
        resetForm();
        onSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save payment preference');
      }
    } catch (error) {
      console.error('Failed to save preference:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePreference = async (id: number) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
      const response = await fetch(`/api/users/payment-preferences/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchData();
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to delete preference:', error);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      const response = await fetch(`/api/users/payment-preferences/${id}/set-default`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchData();
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to set default:', error);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingId(null);
    setSelectedMethod('');
    setPaymentDetails({});
    setError(null);
  };

  const startEdit = (preference: UserPaymentPreferenceType) => {
    setEditingId(preference.id);
    setSelectedMethod(preference.payment_method);
    try {
      setPaymentDetails(JSON.parse(preference.preference_data));
    } catch {
      setPaymentDetails({});
    }
    setShowAddForm(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Payment Preferences</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Saved Payment Methods */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Saved Payment Methods</h3>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Method</span>
              </button>
            </div>

            {userPreferences.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No payment methods saved</h3>
                <p className="text-gray-600 mb-4">Add a payment method to make withdrawals easier</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors"
                >
                  Add Payment Method
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userPreferences.map((preference) => {
                  const methodData = withdrawalMethods.find(m => m.method_name === preference.payment_method);
                  return (
                    <div key={preference.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {getMethodIcon(preference.payment_method)}
                          <div>
                            <h4 className="font-medium text-gray-900">{methodData?.display_name}</h4>
                            <p className="text-sm text-gray-600">{getDisplayInfo(preference)}</p>
                          </div>
                        </div>
                        {preference.is_default && (
                          <span className="flex items-center space-x-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            <Star className="w-3 h-3" />
                            <span>Default</span>
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {!preference.is_default && (
                          <button
                            onClick={() => handleSetDefault(preference.id)}
                            className="flex-1 text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(preference)}
                          className="flex-1 text-xs px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors flex items-center justify-center space-x-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeletePreference(preference.id)}
                          className="flex-1 text-xs px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors flex items-center justify-center space-x-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingId ? 'Edit Payment Method' : 'Add Payment Method'}
              </h3>
              
              <div className="space-y-4">
                {/* Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {withdrawalMethods.filter(method => method.is_active).map((method) => (
                      <button
                        key={method.method_name}
                        onClick={() => setSelectedMethod(method.method_name)}
                        disabled={editingId !== null}
                        className={`p-3 border-2 rounded-lg text-left transition-colors ${
                          selectedMethod === method.method_name
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          {getMethodIcon(method.method_name)}
                          <span className="font-medium text-sm">{method.display_name}</span>
                        </div>
                        <p className="text-xs text-gray-500">{method.processing_time}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Details Form */}
                {selectedMethod && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Payment Details</h4>
                    {getRequiredFields(selectedMethod).map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {getFieldLabel(field)}
                          {field !== 'address_line_2' && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field === 'network' && selectedMethod.startsWith('crypto_') ? (
                          <select
                            value={paymentDetails[field] || ''}
                            onChange={(e) => setPaymentDetails(prev => ({ ...prev, [field]: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select Network</option>
                            <option value="mainnet">Mainnet</option>
                            <option value="ethereum">Ethereum (ERC-20)</option>
                            <option value="bsc">Binance Smart Chain (BEP-20)</option>
                            <option value="polygon">Polygon</option>
                            <option value="arbitrum">Arbitrum</option>
                          </select>
                        ) : field === 'country' ? (
                          <select
                            value={paymentDetails[field] || ''}
                            onChange={(e) => setPaymentDetails(prev => ({ ...prev, [field]: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">Select Country</option>
                            <option value="US">United States</option>
                            <option value="CA">Canada</option>
                            <option value="GB">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="DE">Germany</option>
                            <option value="FR">France</option>
                            <option value="IT">Italy</option>
                            <option value="ES">Spain</option>
                            <option value="NL">Netherlands</option>
                            <option value="JP">Japan</option>
                            <option value="SG">Singapore</option>
                            <option value="IN">India</option>
                            <option value="BR">Brazil</option>
                            <option value="MX">Mexico</option>
                          </select>
                        ) : (
                          <input
                            type={field === 'email_address' ? 'email' : field === 'phone_number' ? 'tel' : 'text'}
                            value={paymentDetails[field] || ''}
                            onChange={(e) => setPaymentDetails(prev => ({ ...prev, [field]: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required={field !== 'address_line_2'}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePreference}
                    disabled={!selectedMethod || loading || getRequiredFields(selectedMethod).some((field: string) => 
                      field !== 'address_line_2' && (!paymentDetails[field] || paymentDetails[field].trim() === '')
                    )}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Saving...' : editingId ? 'Update Method' : 'Save Method'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
