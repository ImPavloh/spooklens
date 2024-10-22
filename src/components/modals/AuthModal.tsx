'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { FiEye, FiEyeOff, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { FaSpider } from 'react-icons/fa'
import { FaSkull } from 'react-icons/fa'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'

import { useAuth } from '@/hooks/useAuth'

import { useUsernameValidator } from '@/utils/UsernameValidator'

const avatars = [
  '/images/avatars/avatar1.png',
  '/images/avatars/avatar2.png',
  '/images/avatars/avatar3.png',
  '/images/avatars/avatar4.png',
  '/images/avatars/avatar5.png',
  '/images/avatars/avatar6.png',
]

const validateEmail = (email: string): boolean => /\S+@\S+\.\S+/.test(email)

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
}

const formContentVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
}

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp, signInAnonymously, resetPassword } = useAuth()
  const [formState, setFormState] = useState({
    emailOrUsername: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    bio: '',
    avatar: avatars[0],
  })
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'signIn' | 'signUp' | 'forgotPassword'>(
    'signIn',
  )
  const [signUpStep, setSignUpStep] = useState<number>(1)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [currentAvatarIndex, setCurrentAvatarIndex] = useState<number>(0)
  const [passwordStrength, setPasswordStrength] = useState<number>(0)
  const { validateUsername } = useUsernameValidator()

  useEffect(() => {
    if (isOpen) {
      document.getElementById('first-input')?.focus()
    }
  }, [isOpen, mode, signUpStep])

  useEffect(() => {
    const strength =
      formState.password.length > 8
        ? (formState.password.match(/[A-Z]/) ? 25 : 0) +
          (formState.password.match(/[a-z]/) ? 25 : 0) +
          (formState.password.match(/[0-9]/) ? 25 : 0) +
          (formState.password.match(/[^A-Za-z0-9]/) ? 25 : 0)
        : 0
    setPasswordStrength(strength)
  }, [formState.password])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setFormState((prev) => ({
        ...prev,
        [name]: name === 'username' ? value.toLowerCase() : value,
      }))
    },
    [],
  )

  const handleAvatarChange = useCallback((direction: 'left' | 'right') => {
    setCurrentAvatarIndex((prevIndex) => {
      let newIndex = direction === 'left' ? prevIndex - 1 : prevIndex + 1
      if (newIndex < 0) newIndex = avatars.length - 1
      if (newIndex >= avatars.length) newIndex = 0
      setFormState((prev) => ({ ...prev, avatar: avatars[newIndex] }))
      return newIndex
    })
  }, [])

  const toggleMode = useCallback(
    (newMode: 'signIn' | 'signUp' | 'forgotPassword') => {
      setMode(newMode)
      setSignUpStep(1)
      setError(null)
    },
    [],
  )

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const validateInput = useCallback((): string | null => {
    if (mode === 'signUp') {
      if (signUpStep === 1 && !validateEmail(formState.email)) {
        return 'Please enter a valid ethereal address (email).'
      }
      if (signUpStep === 2) {
        if (formState.password !== formState.confirmPassword) {
          return 'Your incantations do not match. Try again, apprentice.'
        }
        if (formState.password.length < 6) {
          return 'Your spell must be at least 6 characters long to be effective.'
        }
      }
    }
    return null
  }, [formState, mode, signUpStep])

  const handleGuestSignIn = useCallback(async () => {
    setLoading(true)
    try {
      await signInAnonymously()
      onClose()
      window.location.reload()
    } catch (err: any) {
      setError('The spirits reject your ghostly presence. Try again later.')
    } finally {
      setLoading(false)
    }
  }, [signInAnonymously, onClose])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setLoading(true)
      setError(null)

      if (mode === 'signUp' && signUpStep === 1) {
        const usernameError = await validateUsername(formState.username)
        if (usernameError) {
          setError(usernameError)
          setLoading(false)
          return
        }
      }

      const validationError = validateInput()
      if (validationError) {
        setError(validationError)
        setLoading(false)
        return
      }

      try {
        if (mode === 'forgotPassword') {
          await resetPassword(formState.email)
          alert(
            'A spectral raven has been dispatched with your password reset scroll.',
          )
          toggleMode('signIn')
        } else if (mode === 'signUp') {
          if (signUpStep < 3) {
            setSignUpStep((prev) => prev + 1)
          } else {
            await signUp(formState.email, formState.password, {
              username: formState.username,
              avatar: formState.avatar,
              bio: formState.bio,
              profileVisible: true,
              notificationsEnabled: false,
              createdAt: new Date().toISOString(),
              totalCandies: 10,
              potions: 0,
              totalSpins: 0,
            })
            onClose()
            window.location.reload()
          }
        } else {
          await signIn(formState.emailOrUsername, formState.password)
          onClose()
          window.location.reload()
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [
      mode,
      signUpStep,
      validateInput,
      validateUsername,
      formState.username,
      formState.email,
      formState.password,
      formState.avatar,
      formState.bio,
      formState.emailOrUsername,
      resetPassword,
      toggleMode,
      signUp,
      onClose,
      signIn,
    ],
  )

  const renderSignUpForm = () => {
    switch (signUpStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            variants={formContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div>
              <Label htmlFor="email" className="text-orange-300">
                Email Address
              </Label>
              <Input
                variant="orange"
                id="email"
                name="email"
                placeholder="example@ghost.com"
                value={formState.email}
                onChange={handleChange}
                className="bg-zinc-800 text-orange-100 border-orange-500 focus:ring-orange-400"
              />
            </div>
            <div>
              <Label htmlFor="username" className="text-orange-300">
                Username (This will be your @handle)
              </Label>
              <Input
                variant="orange"
                id="username"
                name="username"
                placeholder="MidnightWhisper"
                value={formState.username}
                onChange={handleChange}
                className="bg-zinc-800 text-orange-100 border-orange-500 focus:ring-orange-400"
              />
            </div>
          </motion.div>
        )
      case 2:
        return (
          <motion.div
            key="step2"
            variants={formContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div>
              <Label htmlFor="password" className="text-orange-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  variant="orange"
                  id="password"
                  name="password"
                  placeholder="Your secret spell"
                  type={showPassword ? 'text' : 'password'}
                  value={formState.password}
                  onChange={handleChange}
                  className="bg-zinc-800 text-orange-100 border-orange-500 focus:ring-orange-400"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-orange-400 hover:text-orange-200"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <Progress value={passwordStrength} className="mt-2" />
              <p className="text-xs text-orange-300 mt-1">
                Password strength:{' '}
                {passwordStrength === 100
                  ? 'Strong'
                  : passwordStrength >= 50
                  ? 'Medium'
                  : 'Weak'}
              </p>
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-orange-300">
                Confirm Password
              </Label>
              <Input
                variant="orange"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Repeat your secret spell"
                type={showPassword ? 'text' : 'password'}
                value={formState.confirmPassword}
                onChange={handleChange}
                className="bg-zinc-800 text-orange-100 border-orange-500 focus:ring-orange-400"
              />
            </div>
          </motion.div>
        )
      case 3:
        return (
          <motion.div
            key="step3"
            variants={formContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex flex-col items-center mb-4">
              <Label className="text-orange-300 mb-2">
                Choose your spectral form
              </Label>
              <div className="flex items-center">
                <Button
                  type="button"
                  onClick={() => handleAvatarChange('left')}
                  className="bg-transparent text-orange-500 hover:text-orange-400"
                >
                  <FiChevronLeft className="h-6 w-6" />
                </Button>
                <motion.div
                  className="relative w-32 h-32 mx-4"
                  key={currentAvatarIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Image
                    src={formState.avatar}
                    alt="User avatar"
                    width={128}
                    height={128}
                    className="rounded-full"
                    priority
                  />
                </motion.div>
                <Button
                  type="button"
                  onClick={() => handleAvatarChange('right')}
                  className="bg-transparent text-orange-500 hover:text-orange-400"
                >
                  <FiChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="bio" className="text-orange-300">
                Biography
              </Label>
              <Textarea
                variant="orange"
                id="bio"
                name="bio"
                placeholder="Tell us about your spectral self..."
                value={formState.bio}
                onChange={handleChange}
                className="bg-zinc-800 text-orange-100 border-orange-500 focus:ring-orange-400 resize-none overflow-auto max-h-20"
                rows={4}
              />
            </div>
          </motion.div>
        )
    }
  }

  const renderSignInForm = () => (
    <motion.div
      key="signIn"
      variants={formContentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div>
        <Label htmlFor="emailOrUsername" className="text-orange-300">
          Email address
        </Label>
        <Input
          variant="orange"
          id="emailOrUsername"
          name="emailOrUsername"
          placeholder="example@ghost.com"
          value={formState.emailOrUsername}
          onChange={handleChange}
          className="bg-zinc-800 text-orange-100 border-orange-500 focus:ring-orange-400"
        />
      </div>
      <div>
        <Label htmlFor="password" className="text-orange-300">
          Password
        </Label>
        <div className="relative">
          <Input
            variant="orange"
            id="password"
            name="password"
            placeholder="Your secret spell"
            type={showPassword ? 'text' : 'password'}
            value={formState.password}
            onChange={handleChange}
            className="bg-zinc-800 text-orange-100  border-orange-500 focus:ring-orange-400"
          />
          <button
            type="button"
            className="absolute right-3 top-3  text-orange-400 hover:text-orange-200"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
      </div>
    </motion.div>
  )

  const renderForgotPasswordForm = () => (
    <motion.div
      key="forgotPassword"
      variants={formContentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div>
        <Label htmlFor="email" className="text-orange-300">
          Ethereal Address
        </Label>
        <Input
          variant="orange"
          id="email"
          name="email"
          placeholder="example@ghost.com"
          value={formState.email}
          onChange={handleChange}
          className="bg-zinc-800 text-orange-100 border-orange-500 focus:ring-orange-400"
        />
      </div>
    </motion.div>
  )

  const renderFormContent = () => {
    switch (mode) {
      case 'signUp':
        return renderSignUpForm()
      case 'forgotPassword':
        return renderForgotPasswordForm()
      default:
        return renderSignInForm()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div variants={modalVariants} className="w-full max-w-md">
            <Card className="relative border-2 border-orange-500 bg-gradient-to-b from-orange-950 to-black shadow-2xl shadow-orange-500/20">
              <CardHeader className="rounded-lg bg-zinc-950 text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-4xl font-bold text-orange-500">
                  <motion.div
                    animate={{ y: [0, -5, 5, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 4,
                      ease: 'easeInOut',
                    }}
                  >
                    <Image
                      src="/images/logo2.png"
                      alt="SpookLens"
                      className="mx-auto filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                      width={60}
                      height={60}
                    />
                  </motion.div>
                  <motion.span
                    key={mode}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  >
                    {mode === 'signUp'
                      ? 'Join the Haunt'
                      : mode === 'forgotPassword'
                      ? 'Invoke a Password'
                      : 'Enter the Crypt'}
                  </motion.span>
                </CardTitle>
              </CardHeader>
              <CardContent className="rounded-lg flex flex-col gap-4 p-6 bg-zinc-900">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <AnimatePresence mode="wait">
                    {renderFormContent()}
                  </AnimatePresence>
                  <div className="flex justify-between">
                    {mode === 'signUp' && signUpStep > 1 && (
                      <Button
                        type="button"
                        onClick={() => setSignUpStep((prev) => prev - 1)}
                        className="bg-orange-600 text-white hover:bg-orange-700"
                      >
                        Back
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={loading}
                      className={`bg-orange-600 text-white hover:bg-orange-700 ${
                        mode === 'signUp' && signUpStep > 1
                          ? 'ml-auto'
                          : 'w-full'
                      }`}
                    >
                      {loading
                        ? 'Casting Spell...'
                        : mode === 'signUp'
                        ? signUpStep < 3
                          ? 'Next'
                          : 'Become a Member!'
                        : mode === 'forgotPassword'
                        ? 'Send a Reset Spell'
                        : 'Step into the Shadows'}
                    </Button>
                  </div>
                </form>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-red-500"
                  >
                    {error}
                  </motion.p>
                )}
                <div className="flex justify-between gap-2 text-orange-300">
                  <button
                    className="underline hover:text-orange-100"
                    onClick={() =>
                      toggleMode(mode === 'signUp' ? 'signIn' : 'signUp')
                    }
                  >
                    {mode === 'signUp'
                      ? 'Already a Ghost? Log In!'
                      : 'Not a Ghost Yet? '}
                  </button>
                  {mode === 'signIn' && (
                    <button
                      className="underline hover:text-orange-100"
                      onClick={() => toggleMode('forgotPassword')}
                    >
                      Forgot Your Spell?
                    </button>
                  )}
                </div>
                {mode === 'signIn' && (
                  <>
                    <div className="flex items-center justify-center">
                      <div className="h-px w-1/4 bg-orange-700"></div>
                      <span className="mx-3 text-orange-400">OR</span>
                      <div className="h-px w-1/4 bg-orange-700"></div>
                    </div>
                    <Button
                      className="flex w-full items-center justify-center gap-2 bg-transparent text-orange-400 hover:text-orange-200 border border-orange-500 hover:bg-orange-900/30"
                      disabled={loading}
                      onClick={handleGuestSignIn}
                    >
                      {loading ? (
                        'Summoning...'
                      ) : (
                        <>
                          <FaSkull />
                          Try as a Ghost! (Anonymous)
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
              <motion.div
                className="absolute -bottom-4 -right-4"
                animate={{
                  rotate: [0, 10, -10, 0],
                  transition: { repeat: Infinity, duration: 5 },
                }}
              >
                <FaSpider className="text-4xl text-orange-800" />
              </motion.div>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
