
import { useState, useContext, FormEvent, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { registerUser, RegisterData } from '../api/auth';
import { AuthContext } from '../contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const { t } = useLanguage();
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  if (!auth) throw new Error('AuthContext must be used within AuthProvider');
  const { login } = auth;

  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    role: "buyer",
  });

  const [error, setError] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await registerUser(formData);
      login(res.data);

      // Redirect based on role
      if (formData.role === "buyer") {
        navigate('/');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-purple flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg p-8 shadow-2xl">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('home')}
            </Link>

            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-800">{t('register')}</h2>
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-500">{t('join_as_seller')}</span>
                <Link to="/seller-request" className="text-sm text-purple-600 hover:underline">
                  {t('register')}
                </Link>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <span>{t('already_have_account')} </span>
              <Link to="/login" className="text-purple-600 hover:underline">
                {t('log_in')}
              </Link>
            </div>
          </div>

          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="text"
                name="name"
                placeholder={t('name')}
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Input
                type="email"
                name="email"
                placeholder={t('email')}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="buyer">{t('buyer')}</option>
                <option value="seller">{t('vendor')}</option>
                <option value="admin">{t('admin')}</option>
              </select>
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                name="password"
                placeholder={t('password')}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                {t('read_terms')}{" "}
                <Link to="/terms" className="text-purple-600 hover:underline">
                  {t('terms_conditions')}
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              disabled={!agreeTerms}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md transition-colors"
            >
              {t('register')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
