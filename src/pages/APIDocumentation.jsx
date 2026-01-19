import { useState } from 'react';
import {
    ChevronLeft,
    Code2,
    Globe,
    ShieldCheck,
    Copy,
    CheckCircle2,
    BookOpen,
    Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const APIDocumentation = () => {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(null);

    const apiRoutes = [
        {
            method: 'GET',
            path: '/api/products',
            desc: 'Fetch full active product catalog.',
            params: 'status=active (default)',
            response: 'Array of Product Objects'
        },
        {
            method: 'POST',
            path: '/api/recommendations',
            desc: 'Save a new AI hair analysis session results.',
            body: '{ clientName, hairAnalysis, suggestedProducts }',
            response: '{ success: true, id: "string" }'
        },
        {
            method: 'GET',
            path: '/api/stylists',
            desc: 'Retrieve list of all active stylists.',
            response: 'Array of Stylist Objects'
        },
        {
            method: 'POST',
            path: '/api/sales',
            desc: 'Record a new product sale transaction.',
            body: '{ stylistId, products, totalAmount }',
            response: '{ success: true, saleId: "string" }'
        },
        {
            method: 'GET',
            path: '/api/recommendations/:clientName',
            desc: 'Fetch history for a specific client.',
            response: 'Array of Session Objects'
        }
    ];

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/developer')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-tea-800" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-tea-800">API Documentation</h1>
                    <p className="text-gray-600 mt-1">Full reference for Saloon App-Side Integration</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sidebar Navigation for Docs (Optional/Static for now) */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="card sticky top-6">
                        <h3 className="font-bold text-tea-800 mb-4 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-tea-700" />
                            Guide
                        </h3>
                        <nav className="space-y-2">
                            <a href="#authentication" className="block text-sm text-gray-600 hover:text-tea-700 font-medium p-2 rounded hover:bg-tea-50">1. Authentication</a>
                            <a href="#base-url" className="block text-sm text-gray-600 hover:text-tea-700 font-medium p-2 rounded hover:bg-tea-50">2. Base URL & Config</a>
                            <a href="#endpoints" className="block text-sm text-gray-600 hover:text-tea-700 font-medium p-2 rounded hover:bg-tea-50">3. Endpoints Reference</a>
                            <a href="#error-handling" className="block text-sm text-gray-600 hover:text-tea-700 font-medium p-2 rounded hover:bg-tea-50">4. Error Handling</a>
                        </nav>
                    </div>
                </div>

                {/* Main Docs Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Intro Section */}
                    <div className="card" id="authentication">
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="w-6 h-6 text-green-600" />
                            <h2 className="text-xl font-bold text-tea-800">Authentication</h2>
                        </div>
                        <p className="text-gray-600 mb-4">
                            The client-side API layer uses Firebase Auth as its primary security mechanism.
                            All requests made through the <code className="bg-gray-100 px-1 rounded">@saloon/api</code> library are automatically signed with the current user's token.
                        </p>
                    </div>

                    {/* Code Integration Section */}
                    <div className="card" id="base-url">
                        <div className="flex items-center gap-3 mb-4">
                            <Code2 className="w-6 h-6 text-tea-700" />
                            <h2 className="text-xl font-bold text-tea-800">Client Integration</h2>
                        </div>
                        <div className="relative group">
                            <button
                                onClick={() => copyToClipboard("import { getProductCatalog } from './lib/api';", 'import')}
                                className="absolute right-4 top-4 p-2 bg-gray-800 text-gray-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                {copied === 'import' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto border border-gray-800 shadow-2xl">
                                <pre className="text-xs text-blue-400 font-mono">
                                    {`// 1. Import Service Layer
import { 
  getProductCatalog, 
  saveAIRecommendation 
} from './lib/api';

// 2. Fetch active catalog
const products = await getProductCatalog();

// 3. Log results to system
const result = await saveAIRecommendation({
  clientName: "Valued Customer",
  hairAnalysis: { type: "Wavy", condition: "Healthy" },
  suggestedProducts: products.slice(0, 2)
});`}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Endpoints Table */}
                    <div className="card" id="endpoints">
                        <div className="flex items-center gap-3 mb-6">
                            <Globe className="w-6 h-6 text-purple-600" />
                            <h2 className="text-xl font-bold text-tea-800">Endpoints Reference</h2>
                        </div>

                        <div className="space-y-6">
                            {apiRoutes.map((route, idx) => (
                                <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden hover:border-tea-200 transition-all">
                                    <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${route.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                                                    route.method === 'POST' ? 'bg-green-100 text-green-700' :
                                                        'bg-orange-100 text-orange-700'
                                                }`}>
                                                {route.method}
                                            </span>
                                            <code className="text-sm font-mono font-bold text-gray-800">{route.path}</code>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <p className="text-sm text-gray-600">{route.desc}</p>
                                        {route.body && (
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Body Params</p>
                                                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-tea-800">{route.body}</code>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Success Response</p>
                                            <code className="text-xs bg-tea-50 px-2 py-1 rounded text-tea-700">{route.response}</code>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="p-6 bg-tea-100 rounded-xl flex items-start gap-4" id="error-handling">
                        <div className="p-2 bg-tea-700 text-white rounded-lg">
                            <Cpu className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-tea-900">Standard Error Responses</h4>
                            <p className="text-sm text-tea-800 mt-1">
                                All API methods return a standard error object in case of failure:
                                <code className="mx-1 px-1 bg-white/50 rounded">{`{ success: false, error: "Reason" }`}</code>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default APIDocumentation;
