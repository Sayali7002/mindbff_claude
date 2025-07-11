'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp } = useAuth();
  const [redirectPath, setRedirectPath] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSignedUp, setIsSignedUp] = useState(false); // New state variable to track successful signup
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyContent, setPolicyContent] = useState<'terms' | 'privacy' | null>(null);

  useEffect(() => {
    // Get redirect path from URL if present
    const redirect = searchParams.get('redirect');
    if (redirect) {
      setRedirectPath(redirect);
    }

    // Get support type from URL if present
    const supportType = searchParams.get('supportType');
    if (supportType === 'support-giver' || supportType === 'support-seeker') {
      localStorage.setItem('supportType', supportType);
    } else if (supportType === 'give') {
      localStorage.setItem('supportType', 'support-giver');
    } else if (supportType === 'need') {
      localStorage.setItem('supportType', 'support-seeker');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSignedUp(false); // Reset on new submission

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Sign up with Supabase via our hook
      const { data, error: signUpError } = await signUp(email, password);

      if (signUpError) {
        throw signUpError;
      }

      // For backward compatibility with existing code
      localStorage.setItem('isAuthenticated', 'true');

      // Store redirect path in localStorage if it exists
      if (redirectPath) {
        localStorage.setItem('redirectAfterProfileSetup', redirectPath);
      }

      // Show success message
      setSuccessMessage('Account created successfully! A confirmation email has been sent to your email address. You can proceed with setting up your profile.');
      setIsSignedUp(true); // Set isSignedUp to true on success

      // You can keep the redirection here if you want it to happen after the message is shown for a while
      // or remove it if you only want the message to stay on screen.
      
      setTimeout(() => {
        router.push('/onboarding/profile-setup');
      }, 10000);
      

    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-xl p-8 shadow-sm">
      {successMessage && (
        <div className="mb-6 p-3 bg-green-50 text-green-800 rounded-lg">
          <p className="text-sm">{successMessage}</p>
        </div>
      )}

      {!isSignedUp && ( // Only show the following if not successfully signed up
        <>
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Create Account</h1>

          {redirectPath && (
            <div className="mb-6 p-3 bg-blue-50 text-blue-800 rounded-lg">
              <p className="text-sm">
                Sign up to continue to {redirectPath.replace(/-/g, ' ')}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-800 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Create a password"
                required
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm your password"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded-full"
                required
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
            I agree to the{' '}
            <button type="button" className="text-blue-600 underline hover:text-blue-800" onClick={() => { setPolicyContent('terms'); setShowPolicyModal(true); }}>
              Terms of Service
            </button>
            {' '}and{' '}
            <button type="button" className="text-blue-600 underline hover:text-blue-800" onClick={() => { setPolicyContent('privacy'); setShowPolicyModal(true); }}>
              Privacy Policy
            </button>
                          </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-lg bg-blue-500 hover:bg-blue-600 transition-all duration-300 rounded-full"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                className="text-blue-600 hover:text-blue-500 rounded-full"
                onClick={() => {
                  // Preserve the redirect parameter when going to login
                  const redirect = searchParams.get('redirect');
                  router.push(redirect ? `/auth/login?redirect=${redirect}` : '/auth/login');
                }}
              >
                Sign in
              </button>
            </p>
          </div>
        </>
      )}

      {/* Policy Modal */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPolicyModal(false)}
              aria-label="Close"
            >
              <span className="material-icons">close</span>
            </button>
            <h2 className="text-xl font-bold mb-4">
              {policyContent === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </h2>
            <div className="max-h-96 overflow-y-auto text-sm text-gray-700 space-y-4">
              {policyContent === 'terms' && (
                <>
                  <p>Welcome to MindBFF! By using our service, you agree to the following terms:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>You must be at least 18 years old to use this service.</li>
                    <li>You are responsible for maintaining the confidentiality of your account.</li>
                    <li>You may not use the service for any unlawful or harmful activities.</li>
                    <li>We reserve the right to suspend or terminate accounts that violate our policies.</li>
                    <li>Content you submit may be moderated for safety and compliance.</li>
                    <li>These terms may be updated from time to time. Continued use constitutes acceptance of changes.</li>
                  </ul>
                </>
              )}
           {policyContent === 'terms' && (
                <>
                  <p>Welcome to MindBFF! By using our service, you agree to the following terms:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>You must be at least 16 years old to use this service.</li>
                    <li>You are responsible for maintaining the confidentiality of your account.</li>
                    <li>You may not use the service for any unlawful or harmful activities.</li>
                    <li>We reserve the right to suspend or terminate accounts that violate our policies.</li>
                    <li>Content you submit may be moderated for safety and compliance.</li>
                    <li>These terms may be updated from time to time. Continued use constitutes acceptance of changes.</li>
                  </ul>
                </>
              )}
              {policyContent === 'privacy' && (
                <>
                  <p><strong>Your Privacy Matters to Us</strong></p>
                  <p>At MindBFF, we are committed to protecting your privacy and handling your data with transparency and care. This policy explains how we collect, use, store, and protect your personal information in line with GDPR and best practices for mental wellness platforms.</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>What Information We Collect Securely</strong><br />
                      - Personal Information: Name, email, date of birth, gender, location, and other profile details you provide.<br />
                      - Sensitive Data: Any information you share about your mental health, mood, journal entries, or support preferences.<br />
                      - Usage Data: How you use our app, device information, and technical logs.
                    </li>
                    <li><strong>How We Use Your Data</strong><br />
                      - To provide and personalize your experience on MindBFF.<br />
                      - To connect you with appropriate support and resources.<br />
                      - To improve our services and develop new features.<br />
                      - To communicate with you about your account, updates, or support.
                    </li>
                    <li><strong>How We Protect Your Data</strong><br />
                      - Sensitive data (date of birth, gender, location, chats, journal, gratitude, strengths) is highly encrypted before storage.<br />
                      - All data is stored securely using industry-standard security measures.<br />
                      - Access to your data is strictly limited to authorized personnel.
                    </li>
                    <li><strong>Sharing and Disclosure</strong><br />
                      - We do <b>not</b> sell your personal data.<br />
                      - We do <b>not</b> share your data with third parties for marketing.<br />
                      - We may use anonymized, aggregated data for research or analytics, but this cannot identify you.<br />
                      - We may disclose data if required by law or to protect your safety or the safety of others.
                    </li>
                    <li><strong>Your Rights</strong><br />
                      - You can access, correct, or delete your data at any time.<br />
                      - You can withdraw your consent or request data portability.<br />
                      - To exercise your rights, contact us at mindbffglobal@gmail.com.
                    </li>
                    <li><strong>Data Retention</strong><br />
                      - We retain your data only as long as necessary for the purposes described above or as required by law.
                    </li>
                    <li><strong>Children’s Privacy</strong><br />
                      - MindBFF is intended for users 16 and older. We do not knowingly collect data from children under 16.
                    </li>
                    <li><strong>Changes to This Policy</strong><br />
                      - We may update this policy from time to time. We will notify you of significant changes.
                    </li>
                    <li><strong>Contact Us</strong><br />
                      - For questions or concerns about your privacy, email our Data Protection Officer at mindbffglobal@gmail.com.
                    </li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}