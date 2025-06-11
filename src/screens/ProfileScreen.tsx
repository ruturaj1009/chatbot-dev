import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  skills: z.string().min(1, 'Please enter at least one skill'),
  yearsExperience: z.number().min(0, 'Experience cannot be negative').max(50, 'Experience cannot exceed 50 years'),
  location: z.string().min(3, 'Please enter a valid location'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  resumeUrl: z.string().url('Please enter a valid resume URL').optional().or(z.literal(''))
})

type ProfileFormData = z.infer<typeof profileSchema>

const ProfileScreen: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange'
  })

  const watchedFields = watch()
  const completedFields = Object.values(watchedFields).filter(Boolean).length
  const totalFields = Object.keys(watchedFields).length
  const progressPercentage = Math.round((completedFields / totalFields) * 100)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or DOC file')
      return
    }

    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Simulate upload progress
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setUploadedFile(file)
          toast.success('File uploaded successfully')
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const removeFile = () => {
    setUploadedFile(null)
    setUploadProgress(0)
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const profileData = {
        ...data,
        skills: data.skills.split(',').map(skill => skill.trim()),
        resumeFile: uploadedFile
      }
      
      console.log('Profile data:', profileData)
      
      setSubmitSuccess(true)
      toast.success('Profile created successfully!')
      
      // Reset form after success
      setTimeout(() => {
        reset()
        setUploadedFile(null)
        setUploadProgress(0)
        setSubmitSuccess(false)
      }, 3000)
      
    } catch (error) {
      toast.error('Failed to create profile. Please try again.')
      console.error('Error creating profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Created Successfully!</h2>
          <p className="text-gray-600">Your profile has been saved and is now visible to potential employers.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Profile</h1>
        <p className="text-gray-600">Build a comprehensive profile to attract the right opportunities</p>
        
        {/* Progress Indicator */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Profile Completion</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                {...register('fullName')}
                type="text"
                id="fullName"
                className={`input-field ${errors.fullName ? 'border-red-500' : ''}`}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                placeholder="your.email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                {...register('phone')}
                type="tel"
                id="phone"
                className="input-field"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Current Location *
              </label>
              <input
                {...register('location')}
                type="text"
                id="location"
                className={`input-field ${errors.location ? 'border-red-500' : ''}`}
                placeholder="City, Country"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Information</h2>
          
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
              Skills *
            </label>
            <input
              {...register('skills')}
              type="text"
              id="skills"
              className={`input-field ${errors.skills ? 'border-red-500' : ''}`}
              placeholder="React, TypeScript, Node.js, Python (separate with commas)"
            />
            {errors.skills && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.skills.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700 mb-1">
              Years of Experience *
            </label>
            <input
              {...register('yearsExperience', { valueAsNumber: true })}
              type="number"
              id="yearsExperience"
              min="0"
              max="50"
              className={`input-field ${errors.yearsExperience ? 'border-red-500' : ''}`}
              placeholder="5"
            />
            {errors.yearsExperience && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.yearsExperience.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn Profile URL
            </label>
            <input
              {...register('linkedinUrl')}
              type="url"
              id="linkedinUrl"
              className={`input-field ${errors.linkedinUrl ? 'border-red-500' : ''}`}
              placeholder="https://linkedin.com/in/yourprofile"
            />
            {errors.linkedinUrl && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.linkedinUrl.message}
              </p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resume</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="resumeUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Resume URL
              </label>
              <input
                {...register('resumeUrl')}
                type="url"
                id="resumeUrl"
                className={`input-field ${errors.resumeUrl ? 'border-red-500' : ''}`}
                placeholder="https://example.com/your-resume.pdf"
              />
              {errors.resumeUrl && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.resumeUrl.message}
                </p>
              )}
            </div>

            <div className="text-center text-gray-500">or</div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resume File
              </label>
              
              {!uploadedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors duration-200">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="text-sm text-gray-600 mb-2">
                    <label htmlFor="resume-upload" className="cursor-pointer text-primary-600 hover:text-primary-500">
                      Click to upload
                    </label>
                    <span> or drag and drop</span>
                  </div>
                  <p className="text-xs text-gray-500">PDF, DOC up to 5MB</p>
                  <input
                    id="resume-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                  />
                </div>
              ) : (
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-900">{uploadedFile.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-secondary"
            disabled={isSubmitting}
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Creating Profile...</span>
              </>
            ) : (
              <span>Create Profile</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProfileScreen