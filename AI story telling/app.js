function App() {
  const { useState, useEffect } = React;

  const [prompt, setPrompt] = useState('');
  const [mainCharacter, setMainCharacter] = useState('');
  const [setting, setSetting] = useState('');
  const [conflict, setConflict] = useState('');
  const [story, setStory] = useState('');
  const [storyTitle, setStoryTitle] = useState(''); // New state for story title
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [storyLength, setStoryLength] = useState('medium');
  const [storyTone, setStoryTone] = useState('neutral');
  const [savedStories, setSavedStories] = useState([]); // State for saved stories
  const [showSavedStoriesModal, setShowSavedStoriesModal] = useState(false); // State for modal visibility

  // Load saved stories from local storage on component mount
  useEffect(() => {
    try {
      const storedStories = localStorage.getItem('aiStories');
      if (storedStories) {
        setSavedStories(JSON.parse(storedStories));
      }
    } catch (e) {
      console.error("Failed to load stories from local storage:", e);
    }
  }, []);

  // Function to generate a story
  const generateStory = async () => {
    setStory('');
    setStoryTitle('');
    setError('');
    setIsLoading(true);

    // No need to check for API key here, backend handles it

    let fullPrompt = `Generate a ${storyLength} creative story with a ${storyTone} tone.`;
    if (prompt) fullPrompt += ` The core idea is: "${prompt}".`;
    if (mainCharacter) fullPrompt += ` The main character is: "${mainCharacter}".`;
    if (setting) fullPrompt += ` The setting is: "${setting}".`;
    if (conflict) fullPrompt += ` The central conflict is: "${conflict}".`;
    fullPrompt += ` Provide the response as a JSON object with two fields: "title" (string) and "story" (string).`;

    try {
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: fullPrompt }] });

      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              "title": { "type": "STRING" },
              "story": { "type": "STRING" }
            },
            "propertyOrdering": ["title", "story"]
          }
        }
      };
      // Use local proxy endpoint (with explicit backend port)
      const apiUrl = "http://localhost:3001/api/gemini";

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch story from AI.');
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const jsonText = result.candidates[0].content.parts[0].text;
        const parsedResult = JSON.parse(jsonText);
        setStoryTitle(parsedResult.title || 'Untitled Story');
        setStory(parsedResult.story || 'No story content generated.');
      } else {
        setError('No story generated. Please try a different prompt.');
      }
    } catch (err) {
      console.error("Error generating story:", err);
      setError(`Error: ${err.message || 'Something went wrong while generating the story. Make sure your prompt is clear and API is enabled.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate a random prompt
  const generateRandomPrompt = async () => {
    setPrompt('');
    setMainCharacter('');
    setSetting('');
    setConflict('');
    setStory('');
    setStoryTitle('');
    setError('');
    setIsLoading(true);

    try {
      let chatHistory = [];
      chatHistory.push({ role: "user", parts: [{ text: "Generate a unique and creative story prompt, focusing on a main character, a unique setting, and an interesting conflict. Provide the response as a simple string, suitable for a text input field." }] });

      const payload = { contents: chatHistory };
      // Use local proxy endpoint (with explicit backend port)
      const apiUrl = "http://localhost:3001/api/gemini";

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate random prompt from AI.');
      }

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const generatedPrompt = result.candidates[0].content.parts[0].text;
        setPrompt(generatedPrompt);
      } else {
        setError('No random prompt generated.');
      }
    } catch (err) {
      console.error("Error generating random prompt:", err);
      setError(`Error: ${err.message || 'Something went wrong while generating a random prompt.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to copy the generated story to the clipboard
  const copyStoryToClipboard = () => {
    if (story) {
      const textToCopy = `${storyTitle}\n\n${story}`;
      const el = document.createElement('textarea');
      el.value = textToCopy;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      // In a real app, you'd show a temporary "Copied!" message here
    }
  };

  // Function to save the current story
  const saveStory = () => {
    if (story && storyTitle) {
      const newStory = {
        id: Date.now(), // Unique ID
        title: storyTitle,
        content: story,
        date: new Date().toLocaleString()
      };
      const updatedStories = [...savedStories, newStory];
      setSavedStories(updatedStories);
      localStorage.setItem('aiStories', JSON.stringify(updatedStories));
      alert('Story saved successfully!'); // Use a simple alert for now
    } else {
      alert('No story to save!');
    }
  };

  // Function to load a saved story
  const loadStory = (storyToLoad) => {
    setStoryTitle(storyToLoad.title);
    setStory(storyToLoad.content);
    setPrompt(''); // Clear prompt as we're loading a full story
    setMainCharacter('');
    setSetting('');
    setConflict('');
    setShowSavedStoriesModal(false); // Close modal
  };

  // Function to delete a saved story
  const deleteStory = (idToDelete) => {
    const updatedStories = savedStories.filter(s => s.id !== idToDelete);
    setSavedStories(updatedStories);
    localStorage.setItem('aiStories', JSON.stringify(updatedStories));
  };

  // Function to clear all inputs and outputs
  const clearAll = () => {
    setPrompt('');
    setMainCharacter('');
    setSetting('');
    setConflict('');
    setStory('');
    setStoryTitle('');
    setError('');
    setIsLoading(false);
    setStoryLength('medium');
    setStoryTone('neutral');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 text-white p-4 sm:p-8 flex items-center justify-center font-sans">
      <div className="bg-gray-900 bg-opacity-80 rounded-2xl shadow-2xl p-6 sm:p-10 w-full max-w-3xl border border-purple-500">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center mb-6 text-purple-300">
          AI Story Generator
        </h1>

        {/* Clear All Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={clearAll}
            className="py-2 px-4 rounded-xl text-sm font-semibold bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-300 ease-in-out"
          >
            Clear All
          </button>
        </div>

        {/* Structured Inputs */}
        <div className="mb-6">
          <label htmlFor="mainPrompt" className="block text-lg font-medium text-purple-200 mb-2">
            Main Idea/Plot (Optional):
          </label>
          <textarea
            id="mainPrompt"
            className="w-full p-4 rounded-xl bg-gray-800 text-white border border-purple-600 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition duration-300 ease-in-out resize-y min-h-[80px]"
            rows="2"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A quest for a magical artifact..."
            aria-label="Main story idea input"
          ></textarea>
        </div>

        <div className="mb-6">
          <label htmlFor="mainCharacter" className="block text-lg font-medium text-purple-200 mb-2">
            Main Character (Optional):
          </label>
          <input
            type="text"
            id="mainCharacter"
            className="w-full p-3 rounded-xl bg-gray-800 text-white border border-purple-600 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition duration-300 ease-in-out"
            value={mainCharacter}
            onChange={(e) => setMainCharacter(e.target.value)}
            placeholder="e.g., A cynical wizard, a brave knight..."
            aria-label="Main character input"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="setting" className="block text-lg font-medium text-purple-200 mb-2">
            Setting (Optional):
          </label>
          <input
            type="text"
            id="setting"
            className="w-full p-3 rounded-xl bg-gray-800 text-white border border-purple-600 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition duration-300 ease-in-out"
            value={setting}
            onChange={(e) => setSetting(e.target.value)}
            placeholder="e.g., A bustling cyberpunk city, an ancient forest..."
            aria-label="Story setting input"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="conflict" className="block text-lg font-medium text-purple-200 mb-2">
            Conflict/Goal (Optional):
          </label>
          <input
            type="text"
            id="conflict"
            className="w-full p-3 rounded-xl bg-gray-800 text-white border border-purple-600 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition duration-300 ease-in-out"
            value={conflict}
            onChange={(e) => setConflict(e.target.value)}
            placeholder="e.g., Overcoming a dragon, finding a cure for a plague..."
            aria-label="Story conflict or goal input"
          />
        </div>

        {/* Random Prompt Button */}
        <div className="mb-6">
          <button
            onClick={generateRandomPrompt}
            disabled={isLoading}
            className={`w-full py-3 px-6 rounded-xl text-lg font-semibold transition duration-300 ease-in-out
              ${isLoading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg transform hover:scale-105'
              }`}
            aria-live="polite"
          >
            {isLoading && prompt === '' && mainCharacter === '' && setting === '' && conflict === '' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Random Prompt...
              </span>
            ) : (
              'Generate Random Prompt'
            )}
          </button>
        </div>


        <div className="mb-6 flex space-x-4">
          <div className="w-1/2">
            <label htmlFor="storyLength" className="block text-lg font-medium text-purple-200 mb-2">
              Story Length:
            </label>
            <select
              id="storyLength"
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-purple-600 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition duration-300 ease-in-out"
              value={storyLength}
              onChange={(e) => setStoryLength(e.target.value)}
              aria-label="Select story length"
            >
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </select>
          </div>

          <div className="w-1/2">
            <label htmlFor="storyTone" className="block text-lg font-medium text-purple-200 mb-2">
              Story Tone/Genre:
            </label>
            <select
              id="storyTone"
              className="w-full p-3 rounded-xl bg-gray-800 text-white border border-purple-600 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition duration-300 ease-in-out"
              value={storyTone}
              onChange={(e) => setStoryTone(e.target.value)}
              aria-label="Select story tone or genre"
            >
              <option value="neutral">Neutral</option>
              <option value="mysterious">Mysterious</option>
              <option value="humorous">Humorous</option>
              <option value="dramatic">Dramatic</option>
              <option value="fantasy">Fantasy</option>
              <option value="sci-fi">Sci-Fi</option>
              <option value="horror">Horror</option>
              <option value="romantic">Romantic</option>
            </select>
          </div>
        </div>

        <button
          onClick={generateStory}
          disabled={isLoading || (!prompt.trim() && !mainCharacter.trim() && !setting.trim() && !conflict.trim())}
          className={`w-full py-3 px-6 rounded-xl text-lg font-semibold transition duration-300 ease-in-out
            ${isLoading || (!prompt.trim() && !mainCharacter.trim() && !setting.trim() && !conflict.trim())
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-purple-700 hover:bg-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg transform hover:scale-105'
            }`}
          aria-live="polite"
        >
          {isLoading && (prompt.trim() || mainCharacter.trim() || setting.trim() || conflict.trim()) ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Story...
            </span>
          ) : (
            'Generate Story'
          )}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-800 bg-opacity-70 rounded-xl border border-red-600 text-red-200 text-center" role="alert">
            <p className="font-medium">Oops! Something went wrong:</p>
            <p>{error}</p>
          </div>
        )}

        {story && (
          <div className="mt-8 p-6 bg-gray-800 bg-opacity-70 rounded-2xl shadow-inner border border-purple-600">
            <h2 className="text-2xl font-bold text-purple-300 mb-4">{storyTitle}</h2>
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">{story}</p>
            <div className="flex justify-between mt-4 space-x-2">
              <button
                onClick={copyStoryToClipboard}
                className="flex-1 py-2 px-4 rounded-xl text-md font-semibold bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-300 ease-in-out"
              >
                Copy Story
              </button>
              <button
                onClick={saveStory}
                className="flex-1 py-2 px-4 rounded-xl text-md font-semibold bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-300 ease-in-out"
              >
                Save Story
              </button>
            </div>
          </div>
        )}

        {/* Saved Stories Button */}
        <div className="mt-6">
          <button
            onClick={() => setShowSavedStoriesModal(true)}
            className="w-full py-3 px-6 rounded-xl text-lg font-semibold bg-indigo-700 hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-900 shadow-lg transform hover:scale-105 transition duration-300 ease-in-out"
          >
            View Saved Stories ({savedStories.length})
          </button>
        </div>

        {/* Saved Stories Modal */}
        {showSavedStoriesModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-purple-500 relative">
              <h2 className="text-2xl font-bold text-purple-300 mb-4">Saved Stories</h2>
              <button
                onClick={() => setShowSavedStoriesModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
                aria-label="Close modal"
              >
                &times;
              </button>
              {savedStories.length === 0 ? (
                <p className="text-gray-400">No stories saved yet.</p>
              ) : (
                <ul className="space-y-4">
                  {savedStories.map((s) => (
                    <li key={s.id} className="bg-gray-700 p-4 rounded-xl flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-semibold text-purple-200">{s.title}</h3>
                        <p className="text-sm text-gray-400">{s.date}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => loadStory(s)}
                          className="py-2 px-4 rounded-lg text-sm font-semibold bg-blue-500 hover:bg-blue-600 transition duration-300 ease-in-out"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => deleteStory(s.id)}
                          className="py-2 px-4 rounded-lg text-sm font-semibold bg-red-500 hover:bg-red-600 transition duration-300 ease-in-out"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}