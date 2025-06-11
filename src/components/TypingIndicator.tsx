import React from 'react'

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 p-4 bg-white rounded-lg shadow-sm max-w-xs">
      <div className="typing-indicator">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <span className="text-sm text-gray-500">AI is typing...</span>
    </div>
  )
}

export default TypingIndicator