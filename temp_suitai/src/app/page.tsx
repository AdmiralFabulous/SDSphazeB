export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-6">SUIT AI v4.b</h1>
          <p className="text-xl text-gray-300 mb-8">
            Camera-Based Digital Tailoring Platform
          </p>
          <p className="text-gray-400 max-w-2xl mx-auto mb-12">
            Get precise body measurements from your webcam and design your perfect
            made-to-measure suit with our AI-powered platform.
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">3D Body Scanning</h3>
              <p className="text-gray-400 text-sm">
                28 precise measurements extracted from webcam video using SMPL-X
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Suit Configurator</h3>
              <p className="text-gray-400 text-sm">
                Design your suit with real-time 3D preview and fabric selection
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Made to Measure</h3>
              <p className="text-gray-400 text-sm">
                Expert tailoring by Raja Exclusive Tailors, delivered worldwide
              </p>
            </div>
          </div>

          <div className="mt-16 space-x-4">
            <a
              href="/admin/orders"
              className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition"
            >
              Admin Dashboard
            </a>
            <a
              href="/api/fabrics"
              className="inline-block bg-gray-700 hover:bg-gray-600 px-6 py-3 rounded-lg font-medium transition"
            >
              View API
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
