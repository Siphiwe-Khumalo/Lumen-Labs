import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  AlertCircle,
  ArrowRight,
  Check,
  LoaderCircle,
  Mail,
  MapPin,
  Send,
} from 'lucide-react'
import texture from '../assets/media/texture-network.jpg'
import { Container } from '../components/layout/Container'
import { Button } from '../components/ui/Button'
import { SectionLabel } from '../components/ui/SectionLabel'
import { engagementOptions } from '../data/site'
import { useReveal } from '../hooks/useReveal'
import { cn } from '../lib/cn'
import { stagger } from '../lib/reveal'

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
  const revealRef = useReveal<HTMLDivElement>()
  const formRef = useRef<HTMLFormElement>(null)
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [enquiryType, setEnquiryType] = useState(engagementOptions[0].action)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionError, setSubmissionError] = useState('')

  const updateValue = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  /** Choosing a route sets the enquiry type and moves focus to the message. */
  const chooseRoute = (action: string) => {
    setEnquiryType(action)
    const field = formRef.current?.querySelector<HTMLTextAreaElement>('#project')
    field?.focus({ preventScroll: false })
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(values)
    setErrors(nextErrors)
    setSubmissionError('')
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)

    try {
      // GitHub Pages is a static host, so delivery needs an explicit endpoint.
      // Without one we surface a configuration error rather than implying the
      // message was sent.
      if (!import.meta.env.VITE_FORM_ENDPOINT) {
        throw new Error('A form endpoint has not been configured')
      }

      const response = await fetch(import.meta.env.VITE_FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ ...values, enquiryType }).toString(),
      })

      if (!response.ok) throw new Error('Form submission failed')
      setIsSubmitted(true)
    } catch {
      setSubmissionError(
        'This enquiry form is not connected to a delivery endpoint yet. Set VITE_FORM_ENDPOINT before launch.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      className="section contact-section"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div className="contact-texture" aria-hidden="true">
        <img src={texture} alt="" loading="lazy" decoding="async" />
      </div>

      <Container>
        <div ref={revealRef}>
          <header className="contact-head" data-reveal>
            <SectionLabel>Engagement / 08</SectionLabel>
            <h2 className="section-title contact-title" id="contact-title">
              Have a technical problem worth solving?
            </h2>
            <p className="lead">
              Let&apos;s build the solution. Pick the route that fits — all three reach
              the same inbox.
            </p>
          </header>

          <div className="routes" data-reveal>
            {engagementOptions.map((option, index) => {
              const selected = option.action === enquiryType
              return (
                <button
                  key={option.action}
                  type="button"
                  className={cn('route glass sheen', selected && 'is-selected')}
                  aria-pressed={selected}
                  onClick={() => chooseRoute(option.action)}
                  data-reveal
                  style={stagger(index)}
                >
                  <span className="mono route-tag">{option.action}</span>
                  <span className="route-title">{option.title}</span>
                  <span className="route-description">{option.description}</span>
                  <span className="route-cue mono">
                    Select <ArrowRight aria-hidden="true" />
                  </span>
                </button>
              )
            })}
          </div>

          <div className="contact-layout">
            <div className="contact-copy" data-reveal>
              <h3 className="contact-sub">What happens next</h3>
              <ol className="contact-steps">
                <li>
                  <span className="mono">01</span>A reply to understand the problem
                  properly.
                </li>
                <li>
                  <span className="mono">02</span>A short scope with an honest view of
                  effort.
                </li>
                <li>
                  <span className="mono">03</span>A start date, or a straight answer if it
                  is not a fit.
                </li>
              </ol>

              <ul className="contact-points">
                <li>
                  <Send aria-hidden="true" />
                  Software, infrastructure, automation, and technical interfaces.
                </li>
                <li>
                  <MapPin aria-hidden="true" />
                  Working with South African businesses, and remotely beyond that.
                </li>
                <li>
                  <Mail aria-hidden="true" />
                  Your details are only used to reply to this enquiry.
                </li>
              </ul>
            </div>

            <div className="glass form-panel" data-reveal style={stagger(1)}>
              {isSubmitted ? (
                <div className="form-success" role="status">
                  <span className="success-badge">
                    <Check aria-hidden="true" />
                  </span>
                  <h3>Thanks for reaching out.</h3>
                  <p>Your enquiry has been sent. We will get back to you soon.</p>
                  <button
                    className="button-quiet"
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                  >
                    Send another enquiry
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} noValidate>
                  <p className="form-context mono">
                    Enquiry type
                    <span>{enquiryType}</span>
                  </p>

                  <div className="form-grid">
                    <Field
                      id="name"
                      label="Name"
                      placeholder="Your name"
                      value={values.name}
                      error={errors.name}
                      onChange={(value) => updateValue('name', value)}
                      required
                    />
                    <Field
                      id="email"
                      label="Email"
                      type="email"
                      placeholder="you@company.co.za"
                      value={values.email}
                      error={errors.email}
                      onChange={(value) => updateValue('email', value)}
                      required
                    />
                    <Field
                      id="company"
                      label="Company"
                      placeholder="Optional"
                      value={values.company}
                      onChange={(value) => updateValue('company', value)}
                    />
                    <Field
                      id="budget"
                      label="Budget"
                      placeholder="Optional"
                      value={values.budget}
                      onChange={(value) => updateValue('budget', value)}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="project">
                      What are you looking to build or solve?{' '}
                      <span aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="project"
                      name="project"
                      rows={5}
                      placeholder="A sentence or two about the project, the problem, or the system involved."
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
                    label="Timeline"
                    placeholder="Optional"
                    value={values.timeline}
                    onChange={(value) => updateValue('timeline', value)}
                  />

                  {submissionError && (
                    <p className="form-error" role="alert">
                      <AlertCircle aria-hidden="true" />
                      {submissionError}
                    </p>
                  )}

                  <div className="form-footer">
                    <p>No newsletter, no follow-up sequence. Just a reply.</p>
                    <Button
                      type="submit"
                      showArrow={!isSubmitting}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <LoaderCircle
                            aria-hidden="true"
                            className="h-4 w-4 animate-spin"
                          />
                          Sending
                        </>
                      ) : (
                        <>
                          <Send aria-hidden="true" className="h-4 w-4" />
                          Send enquiry
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
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
  placeholder?: string
  type?: 'text' | 'email'
  error?: string
  required?: boolean
  onChange: (value: string) => void
}

function Field({
  id,
  label,
  value,
  placeholder,
  type = 'text',
  error,
  required = false,
  onChange,
}: FieldProps) {
  const errorId = `${id}-error`

  return (
    <div className="field">
      <label htmlFor={id}>
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        placeholder={placeholder}
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
