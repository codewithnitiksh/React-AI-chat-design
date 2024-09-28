import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Plus, Trash, Edit, Send, Sparkles, Bot, User, Sun, Moon, Menu, Shield, ArrowDown, X } from 'lucide-react'

const models = [
  { id: 'gpt-3.5', name: 'GPT-3.5' },
  { id: 'gpt-4', name: 'GPT-4' },
]

const examplePrompts = [
  "Explain quantum computing in simple terms",
  "Write a poem about artificial intelligence",
  "How do I make a perfect cup of coffee?",
  "What are the best practices for sustainable living?",
]

export default function Main() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chats, setChats] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState(models[0])
  const [darkMode, setDarkMode] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chats])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    const handleChange = (e) => {
      setSidebarOpen(e.matches)
    }
    mediaQuery.addListener(handleChange)
    setSidebarOpen(mediaQuery.matches)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (chatContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current
        setShowScrollButton(scrollHeight - scrollTop > clientHeight + 100)
      }
    }

    const chatContainer = chatContainerRef.current
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  const handleNewChat = () => {
    const newChat = { id: Date.now(), name: 'New Chat', messages: [] }
    setChats([...chats, newChat])
    setCurrentChat(newChat.id)
  }

  const handleSwitchChat = (id) => {
    setCurrentChat(id)
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }

  const handleRenameChat = (id, newName) => {
    setChats(chats.map(chat => chat.id === id ? { ...chat, name: newName } : chat))
  }

  const handleDeleteChat = (id) => {
    setChats(chats.filter(chat => chat.id !== id))
    if (currentChat === id) {
      setCurrentChat(null)
    }
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const updatedChats = chats.map(chat => {
      if (chat.id === currentChat) {
        return {
          ...chat,
          messages: [...chat.messages, { role: 'user', content: input }]
        }
      }
      return chat
    })

    setChats(updatedChats)
    setInput('')
    setIsLoading(true)

    // Simulate AI response
    const aiResponseTimeout = setTimeout(() => {
      const aiResponse = { role: 'assistant', content: `This is a simulated response to: "${input}"` }
      const updatedChatsWithAI = updatedChats.map(chat => {
        if (chat.id === currentChat) {
          return {
            ...chat,
            messages: [...chat.messages, aiResponse]
          }
        }
        return chat
      })
      setChats(updatedChatsWithAI)
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(aiResponseTimeout)
  }

  const handleStopResponse = () => {
    setIsLoading(false)
    // In a real implementation, you would also need to cancel the API request here
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 dark-mode' : 'bg-gradient-to-br from-gray-100 to-white text-gray-900 light-mode'}`}>
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed inset-y-0 left-0 z-50 w-64 md:w-80 p-6 flex flex-col ${darkMode ? 'bg-gray-800 bg-opacity-90' : 'bg-white bg-opacity-90'} backdrop-blur-lg shadow-2xl`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Chats</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} p-2 rounded-full transition-colors duration-300`}
              >
                <ChevronLeft size={24} />
              </button>
            </div>
            <button
              onClick={handleNewChat}
              className={`${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'} text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 transform hover:scale-105 shadow-lg`}
            >
              <Plus size={20} className="mr-2" /> New Chat
            </button>
            <div className="flex-grow overflow-y-auto space-y-2">
              {chats.map(chat => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer ${
                    currentChat === chat.id 
                      ? darkMode ? 'bg-indigo-600 shadow-lg' : 'bg-indigo-100 shadow-lg' 
                      : darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                  } transition-all duration-300`}
                  onClick={() => handleSwitchChat(chat.id)}
                >
                  <span className="truncate flex-grow font-medium">{chat.name}</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        const newName = prompt('Enter new name:', chat.name)
                        if (newName) handleRenameChat(chat.id, newName)
                      }}
                      className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200`}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteChat(chat.id)
                      }}
                      className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200`}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-6">
              <select
                value={selectedModel.id}
                onChange={(e) => setSelectedModel(models.find(m => m.id === e.target.value))}
                className={`w-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'} py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300`}
              >
                {models.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-grow flex flex-col w-full transition-all duration-300 ${sidebarOpen ? 'md:ml-80' : ''}`}>
        {/* Header */}
        <header className={`flex justify-between items-center p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-full p-3 transition-colors duration-300 shadow-lg`}
          >
            <Menu size={24} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleDarkMode}
            className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-full p-3 transition-colors duration-300 shadow-lg`}
          >
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </motion.button>
        </header>

        {/* Chat Area or Welcome Screen */}
        <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-6 space-y-6">
          {currentChat ? (
            // Chat messages
            chats.find(chat => chat.id === currentChat)?.messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start space-x-4 max-w-3xl ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`p-3 rounded-2xl shadow-lg ${
                    message.role === 'user' 
                      ? darkMode ? 'bg-indigo-600' : 'bg-indigo-500' 
                      : darkMode ? 'bg-gray-700' : 'bg-gray-300'
                  }`}>
                    {message.role === 'user' ? (
                      <User size={24} className="text-white" />
                    ) : (
                      <Bot size={24} className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} />
                    )}
                  </div>
                  <div
                    className={`p-4 rounded-2xl ${
                      message.role === 'user'
                        ? darkMode ? 'bg-indigo-500' : 'bg-indigo-100 text-gray-900'
                        : darkMode ? 'bg-gray-800' : 'bg-white text-gray-900'
                    } shadow-lg`}
                  >
                    {message.content}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            // Welcome screen
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <h1 className="text-5xl font-bold mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
                  Welcome to AI Chat
                </span>
              </h1>
              <p className="text-2xl mb-8 max-w-2xl">
                Experience the power of AI-driven conversations
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <h2 className="text-3xl font-semibold mb-4">Intelligent</h2>
                  <p>Powered by advanced language models</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
                  <h2 className="text-3xl font-semibold mb-4">Versatile</h2>
                  <p>Capable of handling a wide range of topics</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
                  <h2 className="text-3xl font-semibold mb-4">Fast</h2>
                  <p>Get instant responses to your queries</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg">
                  <h2 className="text-3xl font-semibold mb-4">Secure</h2>
                  <p>Your conversations are private and protected</p>
                </div>
              </div>
              <button
                onClick={handleNewChat}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Start a New Chat
              </button>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to Bottom Button */}
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={scrollToBottom}
              className={`fixed bottom-40 right-6 p-3 rounded-full shadow-lg ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              } transition-colors duration-300`}
            >
              <ArrowDown size={24} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Loading Indicator and Stop Button */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`fixed bottom-40 right-6 p-4 rounded-xl shadow-lg ${
                darkMode ? 'bg-gray-700' : 'bg-white'
              } flex items-center space-x-4`}
            >
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
              <span>AI is thinking...</span>
              <button
                onClick={handleStopResponse}
                className={`p-2 rounded-full ${
                  darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'
                } transition-colors duration-300`}
              >
                <X size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input Area */}
        {currentChat && (
          <div className={`p-6 ${darkMode ? 'bg-gray-800 bg-opacity-50' : 'bg-white bg-opacity-50'} backdrop-blur-lg border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {chats.find(chat => chat.id === currentChat)?.messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Example prompts:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {examplePrompts.map((prompt, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setInput(prompt)}
                      className={`text-left p-4 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-xl transition-all duration-300 shadow-md`}
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
            <form onSubmit={handleSendMessage} className="flex items-center space-x-4 mb-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className={`flex-grow p-4 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-900'} rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading}
                className={`${darkMode ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'} text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg flex items-center space-x-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Send size={20} />
                <span className="hidden md:inline">Send</span>
              </motion.button>
            </form>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-4`}>
              <p>
              <Shield size={14} className="inline mr-1" />
                By using this service, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}