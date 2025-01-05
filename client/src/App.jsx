import { TextGenerator } from "./components/TextGenerator";

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900 dark:to-violet-900 py-8 px-4 text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400">
          AI Text Generator
        </h1>
        <TextGenerator />
      </div>
    </div>
  );
}

export default App;
