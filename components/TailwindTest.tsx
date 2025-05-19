export function TailwindTest() {
  return (
    <div className="p-6 m-6 max-w-md mx-auto rounded-xl border-2 border-blue-500 bg-white shadow-lg flex flex-col space-y-4">
      <h2 className="text-2xl font-bold text-purple-700">Tailwind Test Component</h2>

      <div className="bg-red-500 text-white p-4 rounded-lg">This should have a red background</div>

      <div className="bg-blue-500 text-white p-4 rounded-lg">
        This should have a blue background
      </div>

      <div className="bg-green-500 text-white p-4 rounded-lg">
        This should have a green background
      </div>

      <div className="bg-travel-purple text-white p-4 rounded-lg">
        This should use the travel-purple color
      </div>

      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80">
        This button should use primary color
      </button>
    </div>
  );
}
