import { FormEvent, useState } from 'react'
import { Check, LoaderCircle, Send } from 'lucide-react'
import { Container } from '../components/layout/Container'
import { Button } from '../components/ui/Button'
import { SectionLabel } from '../components/ui/SectionLabel'

type FormValues = {
  name: string
  email: string
  company: string
  project: string
  budget: string
  timeline: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const initialValues: FormValues = {
  name: '',
  email: '',
  company: '',
  project: '',
  budget: '',
  timeline: '',
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.name.trim()) errors.name = 'Please add your name.'
  if (!values.email.trim()) errors.email = 'Please add your email address.'
  else if (!/^\S+@\S+\.\S+$/.test(values.email))
    errors.email = 'Please use a valid email address.'
  if (!values.project.trim())
    errors.project = 'Tell us a little about what you are building.'
  return errors
}

export function StartProject() {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionError, setSubmissionError] = useState('')

  const updateValue = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setSubmissionError('')
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)

    try {
      if (!import.meta.env.VITE_FORM_ENDPOINT) {
        throw new Error('A form endpoint has not been configured')
      }

      const response = await fetch(import.meta.env.VITE_FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(values).toString(),
      })

      if (!response.ok) throw new Error('Form submission failed')
      setIsSubmitted(true)
    } catch {
      setSubmissionError(
        'Something went wrong while sending your enquiry. Configure VITE_FORM_ENDPOINT before deploying the enquiry form.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const successMessage = 'Your enquiry has been sent. We will get back to you soon.'

  return (
    <section
      className="section contact-section"
      id="contact"
      aria-labelledby="contact-title"
    >
      <Container>
        <div className="contact-layout">
          <div className="contact-copy">
            <SectionLabel>Start a project / 05</SectionLabel>
            <h2 id="contact-title">Have something worth building?</h2>
            <p>
              Share a little about what you need. Enough to start a useful conversation,
              nothing more.
            </p>
            <div className="contact-note">
              <span className="contact-note-dot" aria-hidden="true" />
              <span>
                Usually best for websites, applications, and technical interfaces.
              </span>
            </div>
          </div>
          <div className="form-panel">
            {isSubmitted ? (
              <div className="form-success" role="status">
                <span className="success-icon">
                  <Check aria-hidden="true" />
                </span>
                <h3>Thanks for reaching out.</h3>
                <p>{successMessage}</p>
                <button
                  className="button-text-only"
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                >
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                  <Field
                    id="name"
                    label="Name"
                    value={values.name}
                    error={errors.name}
                    onChange={(value) => updateValue('name', value)}
                    required
                  />
                  <Field
                    id="email"
                    label="Email"
                    type="email"
                    value={values.email}
                    error={errors.email}
                    onChange={(value) => updateValue('email', value)}
                    required
                  />
                  <Field
                    id="company"
                    label="Company"
                    value={values.company}
                    onChange={(value) => updateValue('company', value)}
                  />
                  <Field
                    id="budget"
                    label="Budget (optional)"
                    value={values.budget}
                    onChange={(value) => updateValue('budget', value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="project">
                    What are you looking to build? <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="project"
                    name="project"
                    rows={5}
                    value={values.project}
                    aria-invalid={Boolean(errors.project)}
                    aria-describedby={errors.project ? 'project-error' : undefined}
                    onChange={(event) => updateValue('project', event.target.value)}
                  />
                  {errors.project && (
                    <span className="field-error" id="project-error">
                      {errors.project}
                    </span>
                  )}
                </div>
                <Field
                  id="timeline"
                  label="Timeline (optional)"
                  value={values.timeline}
                  onChange={(value) => updateValue('timeline', value)}
                />
                {submissionError && (
                  <p className="submission-error" role="alert">
                    {submissionError}
                  </p>
                )}
                <div className="form-submit-row">
                  <p>We will only use these details to respond to your enquiry.</p>
                  <Button type="submit" showArrow={!isSubmitting} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <LoaderCircle
                          aria-hidden="true"
                          className="h-4 w-4 animate-spin"
                        />{' '}
                        Sending
                      </>
                    ) : (
                      <>
                        <Send aria-hidden="true" className="h-4 w-4" /> Send enquiry
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}

type FieldProps = {
  id: keyof FormValues
  label: string
  value: string
  type?: 'text' | 'email'
  error?: string
  required?: boolean
  onChange: (value: string) => void
}

function Field({
  id,
  label,
  value,
  type = 'text',
  error,
  required = false,
  onChange,
}: FieldProps) {
  const errorId = `${id}-error`
  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <span className="field-error" id={errorId}>
          {error}
        </span>
      )}
    </div>
  )
}
