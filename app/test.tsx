export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-8">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">Tailwind Test Page</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-500 text-white rounded-lg">
            This should have a red background
          </div>
          
          <div className="p-4 bg-blue-500 text-white rounded-lg">
            This should have a blue background
          </div>
          
          <div className="p-4 bg-green-500 text-white rounded-lg">
            This should have a green background
          </div>
          
          <div className="p-4 bg-purple-500 text-white rounded-lg">
            This should have a purple background
          </div>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md w-full hover:bg-blue-700 transition">
            Test Button
          </button>
        </div>
      </div>
    </div>
  )
} 