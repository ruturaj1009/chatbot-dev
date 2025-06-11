import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Eye, Save, Send, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'

const jobSchema = z.object({
  jobTitle: z.string().min(3, 'Job title must be at least 3 characters'),
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  jobDescription: z.string().min(50, 'Job description must be at least 50 characters'),
  location: z.string().min(3, 'Location is required'),
  requiredSkills: z.string().min(1, 'Please specify required skills'),
  experienceLevel: z.enum(['Entry', 'Mid', 'Senior', 'Lead', 'Executive']),
  salaryMin: z.number().min(0, 'Minimum salary must be positive'),
  salaryMax: z.number().min(0, 'Maximum salary must be positive'),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship']),
  contactEmail: z.string().email('Please enter a valid email address')
}).refine(data => data.salaryMax >= data.salaryMin, {
  message: "Maximum salary must be greater than or equal to minimum salary",
  path: ["salaryMax"]
})

type JobFormData = z.infer<typeof jobSchema>

const JobPostingScreen: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDraft, setIsDraft] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
    setValue
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    mode: 'onChange',
    defaultValues: {
      experienceLevel: 'Mid',
      employmentType: 'Full-time'
    }
  })

  const watchedData = watch()

  const saveDraft = async () => {
    setIsDraft(true)
    try {
      // Simulate saving draft
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Draft saved successfully!')
    } catch (error) {
      toast.error('Failed to save draft')
    } finally {
      setIsDraft(false)
    }
  }

  const onSubmit = async (data: JobFormData) => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const jobData = {
        ...data,
        requiredSkills: data.requiredSkills.split(',').map(skill => skill.trim()),
        postedDate: new Date().toISOString(),
        id: Date.now().toString()
      }
      
      console.log('Job posting data:', jobData)
      
      setSubmitSuccess(true)
      toast.success('Job posted successfully!')
      
      // Reset form after success
      setTimeout(() => {
        reset()
        setSubmitSuccess(false)
      }, 3000)
      
    } catch (error) {
      toast.error('Failed to post job. Please try again.')
      console.error('Error posting job:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitSuccess) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Posted Successfully!</h2>
          <p className="text-gray-600">Your job posting is now live and visible to potential candidates.</p>
        </motion.div>
      </div>
    )
  }

  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Job Preview</h1>
          <button
            onClick={() => setShowPreview(false)}
            className="btn-secondary"
          >
            Back to Edit
          </button>
        </div>

        <div className="card max-w-3xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{watchedData.jobTitle}</h2>
            <p className="text-lg text-gray-700 mb-1">{watchedData.companyName}</p>
            <p className="text-gray-600">{watchedData.location}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Experience Level</p>
              <p className="text-gray-900">{watchedData.experienceLevel}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Employment Type</p>
              <p className="text-gray-900">{watchedData.employmentType}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Salary Range</p>
              <p className="text-gray-900">
                ${watchedData.salaryMin?.toLocaleString()} - ${watchedData.salaryMax?.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Description</h3>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{watchedData.jobDescription}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {watchedData.requiredSkills?.split(',').map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600">
              Contact: {watchedData.contactEmail}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a Job</h1>
        <p className="text-gray-600">Create a compelling job posting to attract the best candidates</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                {...register('jobTitle')}
                type="text"
                id="jobTitle"
                className={`input-field ${errors.jobTitle ? 'border-red-500' : ''}`}
                placeholder="Senior Frontend Developer"
              />
              {errors.jobTitle && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.jobTitle.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name *
              </label>
              <input
                {...register('companyName')}
                type="text"
                id="companyName"
                className={`input-field ${errors.companyName ? 'border-red-500' : ''}`}
                placeholder="Tech Company Inc."
              />
              {errors.companyName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.companyName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              {...register('location')}
              type="text"
              id="location"
              className={`input-field ${errors.location ? 'border-red-500' : ''}`}
              placeholder="San Francisco, CA / Remote"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.location.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email *
            </label>
            <input
              {...register('contactEmail')}
              type="email"
              id="contactEmail"
              className={`input-field ${errors.contactEmail ? 'border-red-500' : ''}`}
              placeholder="hiring@company.com"
            />
            {errors.contactEmail && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.contactEmail.message}
              </p>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Details</h2>
          
          <div>
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Job Description *
            </label>
            <textarea
              {...register('jobDescription')}
              id="jobDescription"
              rows={8}
              className={`input-field resize-none ${errors.jobDescription ? 'border-red-500' : ''}`}
              placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
            />
            {errors.jobDescription && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.jobDescription.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="requiredSkills" className="block text-sm font-medium text-gray-700 mb-1">
              Required Skills *
            </label>
            <input
              {...register('requiredSkills')}
              type="text"
              id="requiredSkills"
              className={`input-field ${errors.requiredSkills ? 'border-red-500' : ''}`}
              placeholder="React, TypeScript, Node.js, AWS (separate with commas)"
            />
            {errors.requiredSkills && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.requiredSkills.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level *
              </label>
              <select
                {...register('experienceLevel')}
                id="experienceLevel"
                className="input-field"
              >
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Lead">Lead Level</option>
                <option value="Executive">Executive Level</option>
              </select>
            </div>

            <div>
              <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type *
              </label>
              <select
                {...register('employmentType')}
                id="employmentType"
                className="input-field"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Compensation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Salary (USD) *
              </label>
              <input
                {...register('salaryMin', { valueAsNumber: true })}
                type="number"
                id="salaryMin"
                min="0"
                step="1000"
                className={`input-field ${errors.salaryMin ? 'border-red-500' : ''}`}
                placeholder="80000"
              />
              {errors.salaryMin && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.salaryMin.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Salary (USD) *
              </label>
              <input
                {...register('salaryMax', { valueAsNumber: true })}
                type="number"
                id="salaryMax"
                min="0"
                step="1000"
                className={`input-field ${errors.salaryMax ? 'border-red-500' : ''}`}
                placeholder="120000"
              />
              {errors.salaryMax && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.salaryMax.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={saveDraft}
              disabled={isDraft}
              className="btn-secondary flex items-center space-x-2"
            >
              {isDraft ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Draft</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Eye size={16} />
              <span>Preview</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Posting Job...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Post Job</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default JobPostingScreen