import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn } from 'lucide-react';

const Login = ({ forcedRole }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Use the forcedRole prop if provided, otherwise check search params, fallback to manager
    const requestedRole = forcedRole || searchParams.get('role') || 'manager';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(requestedRole, email, password);

        if (result.success) {
            // Redirect to the appropriate dashboard
            navigate(requestedRole === 'super' ? '/super/dashboard' : '/manager/dashboard');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-tea-50/20">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-tea-700/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brown-500/10 rounded-full blur-[120px] animate-pulse" />

            <div className="max-w-md w-full relative z-10">
                {/* Logo Section */}
                <div className="flex items-center gap-2 text-center mb-10 group">
                    <div className="inline-flex items-center justify-center w-24 h-24 mb-6 group-hover:scale-110 group-hover:rotate-180 transition-all duration-100">
                        <img src="/logo.png" alt="Saloon Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-4xl font-black text-tea-900 mb-2 tracking-tight">
                        {requestedRole === 'super' ? 'Super' : 'Saloon Manager'} <span className="text-tea-700">Admin</span>
                    </h1>
                </div>

                {/* Login Card */}
                <div className="glass-card p-8 lg:p-10 border border-tea-700/5">
                    <div className="mb-8 text-center sm:text-left">
                        <h2 className="text-2xl font-black text-tea-900 mb-2 tracking-tight">Welcome Back</h2>
                        <p className="text-tea-500 text-xs font-bold uppercase tracking-widest">Sign in to your {requestedRole === 'super' ? 'Super Admin' : 'Saloon Manager Admin'} account</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl text-xs font-black flex items-center gap-3 animate-shake">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-tea-700 ml-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" title="Password" className="block text-[10px] font-black uppercase tracking-widest text-tea-700 ml-1">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-4 text-lg mt-4 group"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Verifying...</span>
                                </div>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-tea-700/5 text-center">
                        <p className="text-[10px] text-tea-400 uppercase tracking-[0.2em] font-black">
                            Secure Multi-Tenant Authentication
                        </p>
                    </div>
                </div>

                {/* Role Switcher - Only show if not forced into a role */}
                {!forcedRole && (
                    <div className="mt-6 flex justify-center gap-4">
                        <button
                            onClick={() => navigate(`/login?role=${requestedRole === 'super' ? 'manager' : 'super'}`)}
                            className="text-[10px] font-black text-tea-500 hover:text-tea-700 transition-colors uppercase tracking-widest"
                        >
                            Switch to {requestedRole === 'super' ? 'Manager' : 'Super Admin'} Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
