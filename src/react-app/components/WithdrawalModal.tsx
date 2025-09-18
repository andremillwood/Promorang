import { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, Building, Mail, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { UserType, WithdrawalMethodType, UserPaymentPreferenceType } from '@/shared/types';

interface WithdrawalModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function WithdrawalModal({ user, isOpen, onClose, onSuccess }: WithdrawalModalProps) {
  const [step, setStep] = useState<'amount' | 'method' | 'details' | 'confirm'>('amount');
  const [amount, setAmount] = useState<number>(200);
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [paymentDetails, setPaymentDetails] = useState<Record<string, string>>({});
  const [withdrawalMethods, setWithdrawalMethods] = useState<WithdrawalMethodType[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPaymentPreferenceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchWithdrawalMethods();
      fetchUserPreferences();
    }
  }, [isOpen]);

  const fetchWithdrawalMethods = async () => {
    try {
      const response = await fetch('/api/withdrawal/methods', { credentials: 'include' });
      const methods = await response.json();
      setWithdrawalMethods(methods);
    } catch (error) {
      console.error('Failed to fetch withdrawal methods:', error);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const response = await fetch('/api/users/payment-preferences', { credentials: 'include' });
      const preferences = await response.json();
      setUserPreferences(preferences);
    } catch (error) {
      console.error('Failed to fetch user preferences:', error);
    }
  };

  if (!isOpen || !user) return null;

  const eligibleForWithdrawal = (user.gems_balance || 0) >= 200;
  const selectedMethodData = withdrawalMethods.find(m => m.method_name === selectedMethod);
  const feeAmount = selectedMethodData ? (amount * selectedMethodData.fee_percentage / 100) : 0;
  const netAmount = amount - feeAmount;

  const getMethodIcon = (method: string) => {
    if (method.startsWith('crypto_')) return <CreditCard className="w-5 h-5" />;
    if (method === 'bank_account') return <Building className="w-5 h-5" />;
    if (method === 'paypal' || method === 'payoneer') return <Mail className="w-5 h-5" />;
    return <DollarSign className="w-5 h-5" />;
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
      address_line_2: 'Address Line 2 (Optional)',
      city: 'City',
      state: 'State/Province',
      postal_code: 'Postal Code',
      phone_number: 'Phone Number'
    };
    return labels[field] || field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getFieldType = (field: string) => {
    if (field === 'email_address') return 'email';
    if (field === 'phone_number') return 'tel';
    return 'text';
  };

  const isFieldRequired = (field: string): boolean => {
    return !field.includes('optional') && field !== 'address_line_2';
  };

  const handleSubmitWithdrawal = async () => {
    setLoading(true);
    setError(null);

    try {
      // Save payment preference if requested
      if (saveAsDefault) {
        await fetch('/api/users/payment-preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            payment_method: selectedMethod,
            preference_data: paymentDetails,
            is_default: true
          })
        });
      }

      // Submit withdrawal request
      const response = await fetch('/api/withdrawal/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount,
          payment_method: selectedMethod,
          payment_details: paymentDetails
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Withdrawal request failed');
      }
    } catch (error) {
      console.error('Withdrawal failed:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('amount');
    setAmount(200);
    setSelectedMethod('');
    setPaymentDetails({});
    setError(null);
    setSaveAsDefault(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const canProceedToMethod = amount >= 200 && amount <= (user.gems_balance || 0);
  const canProceedToDetails = selectedMethod !== '';
  const canProceedToConfirm = () => {
    const requiredFields = getRequiredFields(selectedMethod);
    return requiredFields.every(field => 
      !isFieldRequired(field) || (paymentDetails[field] && paymentDetails[field].trim() !== '')
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Withdraw Gems</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!eligibleForWithdrawal ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Insufficient Gems</h3>
            <p className="text-gray-600 mb-4">You need at least 200 gems to request a withdrawal.</p>
            <p className="text-sm text-gray-500">Current balance: {user.gems_balance || 0} gems</p>
            <button
              onClick={handleClose}
              className="mt-4 px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center space-x-2 mb-6">
              {['amount', 'method', 'details', 'confirm'].map((stepName, index) => (
                <div key={stepName} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === stepName ? 'bg-purple-500 text-white' :
                    ['amount', 'method', 'details', 'confirm'].indexOf(step) > index ? 'bg-green-500 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  {index < 3 && <div className="w-12 h-0.5 bg-gray-200 mx-2" />}
                </div>
              ))}
            </div>

            {/* Step 1: Amount */}
            {step === 'amount' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Amount (Gems)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Math.max(200, parseInt(e.target.value) || 200))}
                      min="200"
                      max={user.gems_balance || 0}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <div className="flex space-x-2">
                      {[200, 500, 1000, user.gems_balance || 0].filter((v, i, arr) => arr.indexOf(v) === i && v >= 200).map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setAmount(preset)}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
                        >
                          {preset === user.gems_balance ? 'Max' : preset.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Available Balance:</span>
                    <span className="font-medium">{user.gems_balance} gems</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span>Withdrawal Fee (2.5%):</span>
                    <span className="font-medium">~{Math.ceil(amount * 0.025)} gems</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep('method')}
                    disabled={!canProceedToMethod}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {step === 'method' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Payment Method
                  </label>
                  
                  {/* Saved Payment Methods */}
                  {userPreferences.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Saved Methods</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {userPreferences.map((pref) => {
                          const methodData = withdrawalMethods.find(m => m.method_name === pref.payment_method);
                          if (!methodData) return null;
                          
                          let displayInfo = '';
                          try {
                            const data = JSON.parse(pref.preference_data);
                            if (data.email_address) displayInfo = data.email_address;
                            else if (data.wallet_address) displayInfo = `${data.wallet_address.slice(0, 6)}...${data.wallet_address.slice(-4)}`;
                            else if (data.account_number) displayInfo = `****${data.account_number.slice(-4)}`;
                            else displayInfo = 'Saved method';
                          } catch {
                            displayInfo = 'Saved method';
                          }

                          return (
                            <button
                              key={pref.id}
                              onClick={() => {
                                setSelectedMethod(pref.payment_method);
                                setPaymentDetails(JSON.parse(pref.preference_data));
                              }}
                              className={`w-full p-3 border-2 rounded-lg text-left transition-colors ${
                                selectedMethod === pref.payment_method
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                {getMethodIcon(pref.payment_method)}
                                <div>
                                  <p className="font-medium">{methodData.display_name}</p>
                                  <p className="text-sm text-gray-500">{displayInfo}</p>
                                </div>
                                {pref.is_default && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Default</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">Or choose a new method</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {withdrawalMethods.filter(method => method.is_active).map((method) => (
                      <button
                        key={method.method_name}
                        onClick={() => setSelectedMethod(method.method_name)}
                        className={`p-4 border-2 rounded-lg text-left transition-colors ${
                          selectedMethod === method.method_name
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          {getMethodIcon(method.method_name)}
                          <span className="font-medium">{method.display_name}</span>
                        </div>
                        <p className="text-xs text-gray-500">{method.processing_time}</p>
                        <p className="text-xs text-gray-500">Min: {method.min_amount} gems</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep('amount')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('details')}
                    disabled={!canProceedToDetails}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Details */}
            {step === 'details' && selectedMethodData && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{selectedMethodData.display_name}</h3>
                  <p className="text-sm text-gray-600 mb-4">Processing time: {selectedMethodData.processing_time}</p>
                </div>

                <div className="space-y-4">
                  {getRequiredFields(selectedMethod).map((field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {getFieldLabel(field)}
                        {isFieldRequired(field) && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {field === 'network' && selectedMethod.startsWith('crypto_') ? (
                        <select
                          value={paymentDetails[field] || ''}
                          onChange={(e) => setPaymentDetails(prev => ({ ...prev, [field]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required={isFieldRequired(field)}
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
                          required={isFieldRequired(field)}
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
                          <option value="SE">Sweden</option>
                          <option value="NO">Norway</option>
                          <option value="DK">Denmark</option>
                          <option value="FI">Finland</option>
                          <option value="JP">Japan</option>
                          <option value="KR">South Korea</option>
                          <option value="SG">Singapore</option>
                          <option value="HK">Hong Kong</option>
                          <option value="IN">India</option>
                          <option value="BR">Brazil</option>
                          <option value="MX">Mexico</option>
                        </select>
                      ) : (
                        <input
                          type={getFieldType(field)}
                          value={paymentDetails[field] || ''}
                          onChange={(e) => setPaymentDetails(prev => ({ ...prev, [field]: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required={isFieldRequired(field)}
                          placeholder={field === 'wallet_address' ? 'Enter your wallet address' : ''}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="saveAsDefault"
                    checked={saveAsDefault}
                    onChange={(e) => setSaveAsDefault(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="saveAsDefault" className="text-sm text-gray-700">
                    Save this payment method for future withdrawals
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep('method')}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('confirm')}
                    disabled={!canProceedToConfirm()}
                    className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Review
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 'confirm' && selectedMethodData && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Review Withdrawal Request</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Withdrawal Amount:</span>
                      <span className="font-medium">{amount} gems</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing Fee ({selectedMethodData.fee_percentage}%):</span>
                      <span className="font-medium text-red-600">-{feeAmount.toFixed(2)} gems</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Net Amount:</span>
                        <span className="text-green-600">{netAmount.toFixed(2)} gems</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Payment Method: {selectedMethodData.display_name}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {Object.entries(paymentDetails).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{getFieldLabel(key)}:</span>
                          <span className="font-mono">
                            {key.includes('address') && value.length > 20 
                              ? `${value.slice(0, 8)}...${value.slice(-8)}`
                              : value
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Important Notice:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Withdrawal requests cannot be cancelled once submitted</li>
                          <li>Processing time: {selectedMethodData.processing_time}</li>
                          <li>Ensure all payment details are correct</li>
                          <li>You will receive an email confirmation once processed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => setStep('details')}
                    disabled={loading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitWithdrawal}
                    disabled={loading}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Submit Withdrawal</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
