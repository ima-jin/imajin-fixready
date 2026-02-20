'use client';

export default function RoutesPage() {
  const apiRoutes = [
    {
      path: '/api/appliances',
      methods: [
        { method: 'GET', description: 'List all appliances' },
        { method: 'POST', description: 'Register a new appliance' },
      ],
    },
    {
      path: '/api/appliances/[id]',
      methods: [
        { method: 'GET', description: 'Get appliance by ID' },
        { method: 'PUT', description: 'Update appliance details' },
      ],
    },
    {
      path: '/api/requests',
      methods: [
        { method: 'GET', description: 'List all service requests' },
        { method: 'POST', description: 'Create a service request' },
      ],
    },
    {
      path: '/api/requests/[id]',
      methods: [
        { method: 'GET', description: 'Get request by ID' },
        { method: 'PUT', description: 'Update request status' },
      ],
    },
    {
      path: '/api/token/[token]',
      methods: [
        { method: 'GET', description: 'Lookup token → appliance mapping' },
      ],
    },
    {
      path: '/api/qr/generate',
      methods: [
        { method: 'GET', description: 'Generate QR code image for token' },
      ],
    },
  ];

  const pages = [
    {
      section: 'Public',
      routes: [
        { path: '/', description: 'Landing page' },
      ],
    },
    {
      section: 'Customer Registration Flow',
      routes: [
        { path: '/go/[token]', description: 'Start registration (scan QR)' },
        { path: '/go/[token]/type', description: 'Select appliance type' },
        { path: '/go/[token]/identify', description: 'Enter brand/model/serial' },
        { path: '/go/[token]/location', description: 'Enter address & contact' },
        { path: '/go/[token]/done', description: 'Registration complete' },
      ],
    },
    {
      section: 'Service Request Flow',
      routes: [
        { path: '/a/[applianceId]', description: 'Appliance overview' },
        { path: '/a/[applianceId]/symptoms', description: 'Describe the problem' },
        { path: '/a/[applianceId]/details', description: 'Additional details' },
        { path: '/a/[applianceId]/submitted', description: 'Request submitted' },
      ],
    },
    {
      section: 'Technician',
      routes: [
        { path: '/job/[jobId]', description: 'Job detail view' },
      ],
    },
    {
      section: 'Admin',
      routes: [
        { path: '/admin', description: 'Admin dashboard (→ requests)' },
        { path: '/admin/requests', description: 'Service request queue' },
        { path: '/admin/requests/[id]', description: 'Request detail' },
        { path: '/admin/qr', description: 'QR code generator' },
        { path: '/admin/routes', description: 'This page' },
      ],
    },
  ];

  const methodColors: Record<string, string> = {
    GET: 'bg-green-100 text-green-800',
    POST: 'bg-blue-100 text-blue-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Application Routes</h1>
        <p className="text-gray-600 mt-1">All pages and API endpoints</p>
      </div>

      {/* API Routes */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="divide-y divide-gray-200">
            {apiRoutes.map((route) => (
              <div key={route.path} className="p-4">
                <code className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                  {route.path}
                </code>
                <div className="mt-3 space-y-2">
                  {route.methods.map((m) => (
                    <div key={m.method} className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded ${methodColors[m.method]}`}
                      >
                        {m.method}
                      </span>
                      <span className="text-sm text-gray-600">{m.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pages */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Pages</h2>
        <div className="space-y-6">
          {pages.map((section) => (
            <div key={section.section} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">{section.section}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {section.routes.map((route) => (
                  <div key={route.path} className="px-4 py-3 flex items-center justify-between">
                    <code className="text-sm font-mono text-gray-900">{route.path}</code>
                    <span className="text-sm text-gray-500">{route.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
