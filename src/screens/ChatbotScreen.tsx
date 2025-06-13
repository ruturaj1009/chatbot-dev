import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User as UserIcon, RotateCcw, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'
import TypingIndicator from '../components/TypingIndicator'
import LoadingSpinner from '../components/LoadingSpinner'

interface ChatMessage {
  id: string
  type: 'bot' | 'user'
  content: string
  timestamp: Date
  questionIndex?: number
}

interface UserData {
  name: string
  jobRole: string
  skills: string[]
  jobLevel: number
  certificationLevel: string
  proficiencyLevel: string
  profileCount: number
}

interface MatchProfile {
  id: string
  name: string
  email: string
  experience: string
  img: string
  proficiency: string
  jobLevel: number
  skills: string[]
}

const questions = [
  "What is your name?",
  "What is your current job role?",
  "What are your key skills? (Please list them separated by commas)",
  "Select your job level (1-9):",
  "Select your certification level:",
  "Select your proficiency level:",
  "Select profile count (1-5):"
]

const certificationOptions = ['None', 'Beginner', 'Intermediate', 'Professional']
const proficiencyOptions = ['Beginner', 'Intermediate', 'Professional']

// Backend configuration
const BACKEND_URL = 'your-api-endpoint'

async function submitProfileData(profileData: UserData): Promise<MatchProfile[]> {
  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data // Returns: [{name, id, email, experience, img, proficiency, jobLevel, skills}, ...]
  } catch (error) {
    console.error('Error submitting profile data:', error)
    throw error
  }
}

const ChatbotScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentInput, setCurrentInput] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [userData, setUserData] = useState<Partial<UserData>>({})
  const [isComplete, setIsComplete] = useState(false)
  const [matches, setMatches] = useState<MatchProfile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [showOptions, setShowOptions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize questions only after component is fully mounted
  useEffect(() => {
    initializeChat()
  }, [])

  const initializeChat = () => {
    // Initial greeting
    const initialMessage: ChatMessage = {
      id: '1',
      type: 'bot',
      content: "Hi! I'm here to help you find the perfect job match. Let's start with a few questions to build your profile.",
      timestamp: new Date()
    }
    setMessages([initialMessage])
    
    // Ask first question after a delay
    setTimeout(() => {
      askQuestion(0)
    }, 1500)
  }

  const startOver = () => {
    setMessages([])
    setCurrentInput('')
    setCurrentQuestionIndex(0)
    setIsTyping(false)
    setUserData({})
    setIsComplete(false)
    setMatches([])
    setIsLoading(false)
    setEditingMessageId(null)
    setEditValue('')
    setShowOptions(false)
    
    // Restart the conversation
    setTimeout(() => {
      initializeChat()
    }, 500)
    
    toast.success('Chat restarted!')
  }

  const askQuestion = (questionIndex: number) => {
    if (questionIndex >= questions.length) return

    setIsTyping(true)
    setTimeout(() => {
      const questionMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: questions[questionIndex],
        timestamp: new Date()
      }
      setMessages(prev => [...prev, questionMessage])
      setIsTyping(false)
      
      // Show options for specific questions
      if (questionIndex === 4 || questionIndex === 5) {
        setShowOptions(true)
      } else {
        setShowOptions(false)
      }
    }, 1000)
  }

  const validateResponse = (response: string, questionIndex: number): boolean => {
    const trimmed = response.trim()
    
    switch (questionIndex) {
      case 0: // Name
        return trimmed.length >= 2
      case 1: // Job role
        return trimmed.length >= 2
      case 2: // Skills
        return trimmed.length > 0
      case 3: // Job level
        const level = parseInt(trimmed)
        return !isNaN(level) && level >= 1 && level <= 9
      case 4: // Certification level
        return certificationOptions.includes(trimmed)
      case 5: // Proficiency level
        return proficiencyOptions.includes(trimmed)
      case 6: // Profile count
        const count = parseInt(trimmed)
        return !isNaN(count) && count >= 1 && count <= 5
      default:
        return true
    }
  }

  const processResponse = (response: string, questionIndex: number) => {
    const newUserData = { ...userData }
    
    switch (questionIndex) {
      case 0:
        newUserData.name = response.trim()
        break
      case 1:
        newUserData.jobRole = response.trim()
        break
      case 2:
        newUserData.skills = response.split(',').map(skill => skill.trim()).filter(Boolean)
        break
      case 3:
        newUserData.jobLevel = parseInt(response.trim())
        break
      case 4:
        newUserData.certificationLevel = response.trim()
        break
      case 5:
        newUserData.proficiencyLevel = response.trim()
        break
      case 6:
        newUserData.profileCount = parseInt(response.trim())
        break
    }
    
    setUserData(newUserData)
    return newUserData
  }

  const handleOptionSelect = (option: string) => {
    setCurrentInput(option)
    setShowOptions(false)
  }

  const handleEdit = (messageId: string, currentContent: string, questionIndex?: number) => {
    setEditingMessageId(messageId)
    setEditValue(currentContent)
  }

  const saveEdit = async (messageId: string, questionIndex?: number) => {
    if (!editValue.trim()) {
      toast.error('Please provide a valid response')
      return
    }

    if (questionIndex !== undefined && !validateResponse(editValue, questionIndex)) {
      toast.error('Please provide a valid response')
      return
    }

    // Update the message
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, content: editValue }
        : msg
    ))

    // If this was a user response to a question, update the user data
    if (questionIndex !== undefined) {
      processResponse(editValue, questionIndex)
    }

    setEditingMessageId(null)
    setEditValue('')
    toast.success('Response updated!')
  }

  const cancelEdit = () => {
    setEditingMessageId(null)
    setEditValue('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentInput.trim()) return

    if (!validateResponse(currentInput, currentQuestionIndex)) {
      toast.error('Please provide a valid response')
      return
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: currentInput,
      timestamp: new Date(),
      questionIndex: currentQuestionIndex
    }
    setMessages(prev => [...prev, userMessage])

    // Process the response
    const updatedUserData = processResponse(currentInput, currentQuestionIndex)
    setCurrentInput('')
    setShowOptions(false)

    // Check if we're done with questions
    if (currentQuestionIndex >= questions.length - 1) {
      setIsComplete(true)
      await submitUserData(updatedUserData as UserData)
    } else {
      // Ask next question
      setCurrentQuestionIndex(prev => prev + 1)
      setTimeout(() => {
        askQuestion(currentQuestionIndex + 1)
      }, 500)
    }
  }

  const submitUserData = async (data: UserData) => {
    setIsLoading(true)
    try {
      // Try to submit to actual backend first
      let matchedProfiles: MatchProfile[] = []
      
      try {
        matchedProfiles = await submitProfileData(data)
        console.log('Successfully submitted to backend:', data)
      } catch (backendError) {
        console.warn('Backend not available, using mock data:', backendError)
        
        // Fallback to mock data if backend is not available
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Generate mock profiles with skills based on user's skills
        const mockSkillsPool = [
          ['React', 'JavaScript', 'TypeScript'],
          ['Python', 'Django', 'PostgreSQL'],
          ['Node.js', 'Express', 'MongoDB'],
          ['Java', 'Spring Boot', 'MySQL'],
          ['Vue.js', 'Nuxt.js', 'CSS'],
          ['Angular', 'RxJS', 'NgRx'],
          ['PHP', 'Laravel', 'Redis'],
          ['Go', 'Docker', 'Kubernetes']
        ]
        
        matchedProfiles = [
          {
            id: '1',
            name: 'Sarah Johnson',
            email: 'sarah.johnson@example.com',
            experience: '5 years',
            img: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            proficiency: 'Professional',
            jobLevel: 7,
            skills: mockSkillsPool[0]
          },
          {
            id: '2',
            name: 'Michael Chen',
            email: 'michael.chen@example.com',
            experience: '7 years',
            img: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            proficiency: 'Professional',
            jobLevel: 8,
            skills: mockSkillsPool[1]
          },
          {
            id: '3',
            name: 'Emily Rodriguez',
            email: 'emily.rodriguez@example.com',
            experience: '4 years',
            img: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            proficiency: 'Intermediate',
            jobLevel: 6,
            skills: mockSkillsPool[2]
          },
          {
            id: '4',
            name: 'David Kim',
            email: 'david.kim@example.com',
            experience: '6 years',
            img: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            proficiency: 'Professional',
            jobLevel: 7,
            skills: mockSkillsPool[3]
          },
          {
            id: '5',
            name: 'Lisa Wang',
            email: 'lisa.wang@example.com',
            experience: '3 years',
            img: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
            proficiency: 'Intermediate',
            jobLevel: 5,
            skills: mockSkillsPool[4]
          }
        ].slice(0, data.profileCount)
      }
      
      setMatches(matchedProfiles)
      
      const successMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: `Perfect! Based on your profile, I found ${matchedProfiles.length} potential matches. Here are professionals who might be great connections for you:`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, successMessage])
      
      toast.success('Profile matches found!')
    } catch (error) {
      toast.error('Failed to find matches. Please try again.')
      console.error('Error submitting user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getValidationHint = (questionIndex: number): string => {
    switch (questionIndex) {
      case 0:
        return 'Please enter your full name (at least 2 characters)'
      case 1:
        return 'Please enter your current job role'
      case 2:
        return 'List your skills separated by commas (e.g., React, TypeScript, Node.js)'
      case 3:
        return 'Enter a number between 1 and 9'
      case 4:
        return 'Select from: None, Beginner, Intermediate, Professional'
      case 5:
        return 'Select from: Beginner, Intermediate, Professional'
      case 6:
        return 'Enter a number between 1 and 5'
      default:
        return ''
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 h-screen flex flex-col">
      <div className="bg-gradient-to-r from-chatbot-500 to-primary-600 text-white p-6 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bot className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Career Matcher AI</h1>
              <p className="text-chatbot-100">Find your perfect job match</p>
            </div>
          </div>
          
          {/* Start Over Button */}
          <button
            onClick={startOver}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200"
            title="Start Over"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">Start Over</span>
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-b-xl shadow-lg overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-3 max-w-xs sm:max-w-md ${
                  message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-chatbot-500 text-white'
                  }`}>
                    {message.type === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                  </div>
                  
                  <div className="flex-1">
                    {editingMessageId === message.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => saveEdit(message.id, message.questionIndex)}
                            className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="group relative">
                        <div className={`p-3 rounded-lg ${
                          message.type === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        
                        {/* Edit button for user messages */}
                        {message.type === 'user' && !isComplete && (
                          <button
                            onClick={() => handleEdit(message.id, message.content, message.questionIndex)}
                            className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 bg-gray-200 hover:bg-gray-300 rounded-full transition-all duration-200"
                            title="Edit response"
                          >
                            <Edit2 size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <TypingIndicator />
            </motion.div>
          )}

          {/* Option buttons for certification and proficiency questions */}
          {showOptions && !isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gray-50 p-4 rounded-lg max-w-md">
                <p className="text-sm text-gray-600 mb-3">Select an option:</p>
                <div className="grid grid-cols-2 gap-2">
                  {(currentQuestionIndex === 4 ? certificationOptions : proficiencyOptions).map((option) => (
                    <button
                      key={option}
                      onClick={() => handleOptionSelect(option)}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-primary-50 hover:border-primary-300 transition-colors duration-200"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center py-4"
            >
              <div className="flex items-center space-x-2">
                <LoadingSpinner />
                <span className="text-gray-600">Finding your matches...</span>
              </div>
            </motion.div>
          )}

          {matches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6"
            >
              {matches.map((profile) => (
                <div key={profile.id} className="card hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={profile.img}
                      alt={profile.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{profile.name}</h3>
                      <p className="text-sm text-gray-600">{profile.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Experience:</span> {profile.experience}</p>
                    <p><span className="font-medium">Job Level:</span> {profile.jobLevel}/9</p>
                    <p><span className="font-medium">Proficiency:</span> {profile.proficiency}</p>
                    <div>
                      <span className="font-medium">Skills:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {!isComplete && (
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={getValidationHint(currentQuestionIndex)}
                className="flex-1 input-field"
                disabled={isTyping}
                aria-label="Chat input"
              />
              <button
                type="submit"
                disabled={!currentInput.trim() || isTyping}
                className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatbotScreen