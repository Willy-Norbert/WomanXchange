
import { useState, useContext, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, LoginData } from "../api/auth";
import { AuthContext } from "../contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Login = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (!auth) throw new Error("AuthContext must be used within AuthProvider");

  const { login } = auth;

  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await loginUser(formData);
      login(res.data);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-purple flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-8">
            w<span className="text-purple-200">X</span>c
          </h1>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-600">{t('common.email')}</label>
              <Input
                type="email"
                name="email"
                placeholder={t('auth.enterEmail')}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-600">{t('common.password')}</label>
              <Input
                type="password"
                name="password"
                placeholder={t('auth.enterPassword')}
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
              />
              <label htmlFor="remember" className="text-sm text-gray-600">
                {t('auth.rememberMe')}
              </label>
            </div>

            <div className="text-center">
              <Link to="/forgot-password" className="text-sm text-purple-600 hover:underline">
                {t('auth.forgotPassword')}
              </Link>
            </div>

            {error && <p className="text-red-600 text-sm text-center">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-md transition-colors"
            >
              {t('auth.login')}
            </Button>

            <div className="text-center">
              <span className="text-sm text-gray-600">{t('auth.dontHaveAccount')} </span>
              <Link to="/register" className="text-sm text-purple-600 hover:underline">
                {t('auth.register')}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
