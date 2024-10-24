// refactorizar codigo en el futuro, está todo junto adrede "temporalmente"
'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Image from 'next/image'
import ReactCrop, { type Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  FaUpload,
  FaCheck,
  FaCamera,
  FaExclamationCircle,
  FaGhost,
  FaCrop,
  FaEdit,
  FaMagic,
  FaSpider,
  FaArrowRight,
  FaArrowLeft,
  FaSearchPlus,
  FaSearchMinus,
  FaUndo,
  FaAdjust,
  FaPaintBrush,
  FaMoon,
  FaSkull,
  FaSave,
} from 'react-icons/fa'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { useAuth } from '@/hooks/useAuth'
import { useFirestore } from '@/hooks/useFirestore'
import { storage } from '@/lib/firebase'

interface SpookyUploaderModalProps {
  isOpen: boolean
  onClose: () => void
  onImageFinalized: (imageData: {
    url: string
    title: string
    description: string
    timestamp: string
  }) => void
}

const steps = [
  { icon: FaGhost, title: 'Summon', description: 'Upload your spooky image' },
  {
    icon: FaCrop,
    title: 'Frame',
    description: 'Crop to vertical aspect ratio',
  },
  { icon: FaEdit, title: 'Enchant', description: 'Apply magical effects' },
  {
    icon: FaMagic,
    title: 'Caption',
    description: 'Add a haunting description',
  },
  { icon: FaSpider, title: 'Background', description: 'Set an eerie scene' },
]

const CloudinaryEdit = ({
  imageUrl,
  onImageEdited,
}: {
  imageUrl: string
  onImageEdited: (url: string) => void
}) => {
  const [currentEffect, setCurrentEffect] = useState<string>('original')
  const [loading, setLoading] = useState<boolean>(false)
  const [imageLoaded, setImageLoaded] = useState<boolean>(false)
  const [intensity, setIntensity] = useState<number>(50)

  const effects = [
    {
      name: 'original',
      icon: <FaUndo className="w-4 h-4" />,
      color: 'bg-primary',
    },
    {
      name: 'sepia',
      icon: <FaAdjust className="w-4 h-4" />,
      color: 'bg-amber-600',
    },
    {
      name: 'cartoonify',
      icon: <FaPaintBrush className="w-4 h-4" />,
      color: 'bg-purple-600',
    },
    {
      name: 'vignette',
      icon: <FaMoon className="w-4 h-4" />,
      color: 'bg-indigo-600',
    },
    {
      name: 'spooky',
      icon: <FaSkull className="w-4 h-4" />,
      color: 'bg-gray-800',
    },
  ]

  useEffect(() => {
    setImageLoaded(false)
  }, [currentEffect, intensity])

  const applyEffect = (effect: string) => {
    setCurrentEffect(effect)
    if (effect === 'spooky') {
      setIntensity(100)
    }
  }

  const saveEdit = () => {
    if (imageUrl) {
      setLoading(true)
      const editedUrl =
        currentEffect === 'original'
          ? imageUrl
          : `${imageUrl.split('/upload/')[0]}/upload/${getTransformation()}/${
              imageUrl.split('/upload/')[1]
            }`
      onImageEdited(editedUrl)
      setLoading(false)
    }
  }

  const getTransformation = () => {
    const intensityValue = Math.round((intensity / 100) * 100)
    switch (currentEffect) {
      case 'sepia':
        return `e_sepia:${intensityValue}`
      case 'cartoonify':
        return `e_cartoonify:${intensityValue}`
      case 'vignette':
        return `e_vignette:${intensityValue}`
      case 'spooky':
        return 'e_art:zorro'
      default:
        return ''
    }
  }

  const displayUrl = `${
    imageUrl.split('/upload/')[0]
  }/upload/${getTransformation()}/${imageUrl.split('/upload/')[1]}`

  return (
    <Card className="w-full max-w-sm mx-auto bg-background shadow-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold">Enchant Your Image</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg shadow-md max-w-64 max-h-96 mx-auto flex items-center">
          {!imageLoaded && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentEffect + intensity}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={displayUrl}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
                alt="Edited image preview"
                onLoad={() => setImageLoaded(true)}
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {effects.map((effect) => (
            <TooltipProvider key={effect.name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => applyEffect(effect.name)}
                    className={`w-full h-14 ${
                      currentEffect === effect.name
                        ? `${effect.color} text-white ring-2 ring-offset-2 ring-offset-background ring-${effect.color}`
                        : 'bg-secondary hover:bg-secondary/80'
                    } transition-all duration-200`}
                    aria-pressed={currentEffect === effect.name}
                  >
                    <motion.span
                      initial={{ scale: 1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center justify-center"
                    >
                      {effect.icon}
                      <span className="text-[10px] mt-1 font-medium">
                        {effect.name.charAt(0).toUpperCase() +
                          effect.name.slice(1)}
                      </span>
                    </motion.span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Apply {effect.name} effect</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        {currentEffect !== 'original' && currentEffect !== 'spooky' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label htmlFor="intensity" className="text-sm font-medium block">
                Effect Intensity
              </label>
              <Badge variant="secondary">{intensity}%</Badge>
            </div>
            <Slider
              id="intensity"
              min={0}
              max={100}
              step={1}
              value={[intensity]}
              onValueChange={(value) => setIntensity(value[0])}
              className="w-full"
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={saveEdit}
          className="w-full h-10 text-base duration-200 hover:bg-primary/90 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || currentEffect === 'original'}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </Card>
  )
}

// es MUY lento (unos 30 segundos cada imagen nueva, si es imagen repetida suele repetir semilla y tardar menos), habría que avisar al usuario para que no piense que no funciona
interface CloudinaryBackgroundReplaceProps {
  imageUrl: string
  onBackgroundReplaced: (url: string) => void
}

const CloudinaryBackgroundReplace: React.FC<
  CloudinaryBackgroundReplaceProps
> = ({ imageUrl, onBackgroundReplaced }) => {
  const [backgroundReplaced, setBackgroundReplaced] = useState(false)
  const [prompt, setPrompt] = useState<string>('a spooky scene')
  const [isLoading, setIsLoading] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [replacedImageUrl, setReplacedImageUrl] = useState<string | null>(null)

  const applyBackgroundReplace = useCallback(() => {
    if (imageUrl) {
      setIsLoading(true)
      setBackgroundReplaced(true)
      setTimeout(() => {
        setIsLoading(false)
        const transformedUrl = `${
          imageUrl.split('/upload/')[0]
        }/upload/e_gen_background_replace:prompt_${encodeURIComponent(
          prompt,
        )},c_fill,w_800/${imageUrl.split('/upload/')[1]}`
        setReplacedImageUrl(transformedUrl)
      }, 12000)
    }
  }, [imageUrl, prompt])

  const saveBackgroundReplace = useCallback(() => {
    if (backgroundReplaced && replacedImageUrl) {
      onBackgroundReplaced(replacedImageUrl)
    }
  }, [backgroundReplaced, replacedImageUrl, onBackgroundReplaced])

  const resetBackground = useCallback(() => {
    setBackgroundReplaced(false)
    setPrompt('a spooky scene')
    setImageLoaded(false)
    setError(null)
    setReplacedImageUrl(null)
  }, [])

  const displayUrl = replacedImageUrl || imageUrl

  return (
    <Card className="w-full max-w-sm mx-auto bg-background shadow-lg">
      <CardHeader>
        <h3 className="text-lg font-semibold text-center">
          Set an Eerie Scene (wait ~1 minute)
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-[9/16] w-64 h-96 overflow-hidden rounded-lg shadow-lg mx-auto">
          {!imageLoaded && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={displayUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src={displayUrl}
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
                alt="Image with replaced background"
                onLoad={() => setImageLoaded(true)}
              />
            </motion.div>
          </AnimatePresence>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary" />
            </div>
          )}
        </div>

        <Input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the new background"
          className="w-full"
        />

        {error && (
          <Alert variant="destructive">
            <FaExclamationCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-row gap-3 w-full">
          {[
            {
              icon: FaMagic,
              text: 'Replace',
              onClick: applyBackgroundReplace,
              disabled: isLoading,
              className: 'bg-primary hover:bg-primary/90',
            },
            {
              icon: FaSave,
              text: 'Save',
              onClick: saveBackgroundReplace,
              disabled: !backgroundReplaced || isLoading,
              className: 'bg-green-600 hover:bg-green-700',
            },
            {
              icon: FaUndo,
              text: 'Reset',
              onClick: resetBackground,
              disabled: !backgroundReplaced || isLoading,
              className: 'bg-destructive hover:bg-destructive/90',
            },
          ].map(({ icon: Icon, text, onClick, disabled, className }, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onClick}
                    disabled={disabled}
                    className={`w-full ${className} ${
                      disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    aria-label={text}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {text}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{text} background</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function SpookyUploader({
  isOpen,
  onClose,
  onImageFinalized,
}: SpookyUploaderModalProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [image, setImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null)
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [isCaptionLoading, setIsCaptionLoading] = useState<boolean>(false)
  const [finalizedImageUrl, setFinalizedImageUrl] = useState<string | null>(
    null,
  )
  const [crop, setCrop] = useState<Crop>()
  const [zoom, setZoom] = useState<number>(1)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const { user } = useAuth()
  const { addDocument, updateDocument } = useFirestore()

  const resetModal = useCallback(() => {
    setActiveStep(0)
    setImage(null)
    setImageUrl(null)
    setCroppedImageUrl(null)
    setCloudinaryUrl(null)
    setUploading(false)
    setError(null)
    setProgress(0)
    setTitle('')
    setDescription('')
    setIsCaptionLoading(false)
    setFinalizedImageUrl(null)
    setCrop(undefined)
    setZoom(1)
    setUploadProgress(0)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      resetModal()
    }
  }, [isOpen, resetModal])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0]
        setImage(file)
        setError(null)

        const reader = new FileReader()
        reader.onload = (event) => {
          setImageUrl(event.target?.result as string)
        }
        reader.readAsDataURL(file)
      }
    },
    [],
  )

  const uploadToCloudinary = useCallback(async (base64Image: string) => {
    try {
      const uploadResponse = await fetch('/api/upload-cloudinary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(
          errorData.error || 'Failed to upload image to Cloudinary',
        )
      }

      const { url } = await uploadResponse.json()
      return url
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error)
      throw error
    }
  }, [])

  const generateCaptions = useCallback(async (imageUrl: string) => {
    setIsCaptionLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-captions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate captions')
      }

      const data = await response.json()

      setTitle(data.title)
      setDescription(data.description)

      if (data.title.includes('Error') || data.description.includes('error')) {
        setError(
          'There was an issue generating captions. Please try again or use a different image.',
        )
      }
    } catch (error) {
      console.error('Error generating captions:', error)
      setError(
        error instanceof Error
          ? `Failed to generate captions: ${error.message}`
          : 'Failed to generate captions. Please try again.',
      )
    } finally {
      setIsCaptionLoading(false)
    }
  }, [])

  useEffect(() => {
    if (cloudinaryUrl && activeStep === 3) {
      generateCaptions(cloudinaryUrl)
    }
  }, [cloudinaryUrl, activeStep, generateCaptions])

  const handleNext = useCallback(async () => {
    if (activeStep === 0 && imageUrl) {
      setActiveStep(1)
    } else if (activeStep === 1 && croppedImageUrl) {
      setUploading(true)
      setError(null)
      try {
        const cloudinaryUrl = await uploadToCloudinary(croppedImageUrl)
        setUploading(false)
        if (cloudinaryUrl) {
          setCloudinaryUrl(cloudinaryUrl)
          setActiveStep(2)
        } else {
          throw new Error('Failed to upload image to Cloudinary')
        }
      } catch (error) {
        setUploading(false)
        setError(`Error uploading to Cloudinary: ${(error as Error).message}`)
        console.error('Error uploading to Cloudinary:', error)
      }
    } else if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1)
    }
  }, [activeStep, imageUrl, croppedImageUrl, uploadToCloudinary])

  const handleRetake = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  const handleCropComplete = useCallback((croppedAreaPixels: any) => {
    if (imageRef.current && croppedAreaPixels) {
      const canvas = document.createElement('canvas')
      const image = imageRef.current
      const scaleX = image.naturalWidth / image.width
      const scaleY = image.naturalHeight / image.height
      canvas.width = croppedAreaPixels.width
      canvas.height = croppedAreaPixels.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(
          image,
          croppedAreaPixels.x * scaleX,
          croppedAreaPixels.y * scaleY,
          croppedAreaPixels.width * scaleX,
          croppedAreaPixels.height * scaleY,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
        )
        const croppedImageUrl = canvas.toDataURL('image/jpeg')
        setCroppedImageUrl(croppedImageUrl)
      }
    }
  }, [])

  const handleImageEdited = useCallback((url: string) => {
    setCloudinaryUrl(url)
    setActiveStep(3)
  }, [])

  const handleUploadToFirebase = useCallback(
    async (finalImageUrl: string) => {
      if (!user) {
        setError('Please log in to upload your image.')
        return
      }

      setUploading(true)
      setError(null)
      setUploadProgress(0)

      try {
        const response = await fetch(finalImageUrl)
        const blob = await response.blob()
        const fileName = `${Date.now()}_final_image.jpg`
        const storageRef = ref(storage, `images/${user.uid}/${fileName}`)
        const uploadTask = uploadBytesResumable(storageRef, blob)

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            setUploadProgress(progress)
          },
          (error) => {
            console.error('Upload error:', error)
            setError('Failed to upload image. Please try again.')
            setUploading(false)
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

              const imageDoc = await addDocument('images', {
                userId: user.uid,
                imageUrl: downloadURL,
                title,
                description,
                createdAt: new Date(),
              })

              if (imageDoc && imageDoc.id) {
                await updateDocument('users', user.uid, {
                  imageHistory: {
                    [imageDoc.id]: {
                      imageUrl: downloadURL,
                      title,
                      description,
                      createdAt: new Date(),
                    },
                  },
                  profileImage: downloadURL, // modificar o quitar esto
                })

                setUploading(false)
                onImageFinalized({
                  url: downloadURL,
                  title,
                  description,
                  timestamp: new Date().toISOString(),
                })
                onClose()
              } else {
                throw new Error('Failed to add image document')
              }
            } catch (err) {
              console.error('Firestore error:', err)
              setError('Failed to save image information. Please try again.')
              setUploading(false)
            }
          },
        )
      } catch (err) {
        console.error('Error in upload process:', err)
        setError('An error occurred. Please try again.')
        setUploading(false)
      }
    },
    [
      user,
      title,
      description,
      addDocument,
      updateDocument,
      onImageFinalized,
      onClose,
    ],
  )

  const handleBackgroundReplaced = useCallback(
    (url: string) => {
      setFinalizedImageUrl(url)
      setActiveStep(5)
      handleUploadToFirebase(url)
    },
    [handleUploadToFirebase],
  )

  const handleSkip = useCallback(() => {
    if (activeStep === 2) {
      setActiveStep(3)
    } else if (activeStep === 4) {
      handleBackgroundReplaced(cloudinaryUrl || '')
    }
  }, [activeStep, cloudinaryUrl, handleBackgroundReplaced])

  const handleZoomChange = useCallback((value: number[]) => {
    setZoom(value[0])
  }, [])

  const renderStepContent = useCallback(() => {
    switch (activeStep) {
      case 0:
        return (
          <Card className="w-full max-w-sm mx-auto bg-background shadow-lg">
            <CardHeader>
              <h3 className="text-lg font-semibold text-center">
                Summon Your Image
              </h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative w-64 h-96 mx-auto">
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer rounded-lg bg-gray-800 hover:bg-gray-700 border-2 border-dashed border-orange-500 h-full w-full flex flex-col items-center justify-center transition-all relative overflow-hidden"
                >
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt="Spooky preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.5 }}
                      className="flex flex-col items-center"
                    >
                      <Image
                        src="/images/camera-logo2.png"
                        alt="SpookLens Camera"
                        width={160}
                        height={160}
                        priority
                      />
                      <span className="text-orange-300 text-sm">
                        Click to Capture
                      </span>
                      <span className="text-orange-300 text-xs mt-2">
                        Vertical images preferred
                      </span>
                    </motion.div>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    ref={fileInputRef}
                  />
                </label>
              </div>

              <div className="flex space-x-4 w-full">
                <Button
                  onClick={handleNext}
                  disabled={!imageUrl}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {imageUrl ? (
                    <FaCheck className="mr-2 h-4 w-4" />
                  ) : (
                    <FaUpload className="mr-2 h-4 w-4" />
                  )}
                  Next Step
                </Button>

                {imageUrl && (
                  <Button
                    onClick={handleRetake}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
                  >
                    <FaCamera className="mr-2 h-4 w-4" />
                    Retake
                  </Button>
                )}
              </div>

              {error && (
                <Alert
                  variant="destructive"
                  className="w-full bg-red-900 border border-red-500"
                >
                  <FaExclamationCircle className="h-5 w-5 text-red-500" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )
      case 1:
        return (
          <Card className="w-full max-w-sm mx-auto bg-background shadow-lg">
            <CardHeader>
              <h3 className="text-lg font-semibold text-center">
                Click to adjust crop
              </h3>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative max-w-64 max-h-96 mx-auto flex items-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={handleCropComplete}
                  aspect={9 / 16}
                >
                  <Image
                    ref={imageRef}
                    src={imageUrl || '/images/placeholder916.jpg'}
                    alt="Crop preview"
                    width={400}
                    height={400}
                    className="max-w-full h-auto"
                    style={{
                      transform: `scale(${zoom})`,
                      transformOrigin: 'center',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                </ReactCrop>
              </div>
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="zoom"
                    className="text-sm font-medium text-foreground"
                  >
                    Zoom
                  </label>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="icon"
                      onClick={() => setZoom((prev) => Math.max(1, prev - 0.1))}
                    >
                      <FaSearchMinus className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={() => setZoom((prev) => Math.min(3, prev + 0.1))}
                    >
                      <FaSearchPlus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Slider
                  id="zoom"
                  min={1}
                  max={3}
                  step={0.1}
                  value={[zoom]}
                  onValueChange={handleZoomChange}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between items-center space-x-4">
                <Button
                  onClick={() => setActiveStep((prev) => Math.max(prev - 1, 0))}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all"
                >
                  <FaArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!croppedImageUrl}
                  className="flex-grow bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaCheck className="mr-2 h-4 w-4" />
                  Apply Crop
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      case 2:
        return cloudinaryUrl ? (
          <div className="space-y-4">
            <CloudinaryEdit
              imageUrl={cloudinaryUrl}
              onImageEdited={handleImageEdited}
            />
            {/*<Button onClick={handleSkip} className="w-full mt-4">
              Skip Editing
            </Button>*/}
          </div>
        ) : (
          <div>Error: No Cloudinary URL available</div>
        )
      case 3:
        return (
          <Card className="w-full max-w-sm mx-auto bg-gray-900 shadow-lg border-orange-500 border">
            <CardHeader>
              <h3 className="text-lg font-semibold text-orange-300">
                Describe Your Spooky Creation
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-orange-300">
                  Haunting Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    isCaptionLoading
                      ? 'Summoning title from the beyond...'
                      : 'Enter a spine-chilling title'
                  }
                  className="bg-gray-800 text-white border-orange-500 focus:ring-orange-500 placeholder-gray-500"
                  disabled={isCaptionLoading}
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-orange-300">
                  Eerie Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    isCaptionLoading
                      ? 'Channeling spectral descriptions...'
                      : 'Describe your haunting image in gruesome detail'
                  }
                  className="bg-gray-800 text-white border-orange-500 focus:ring-orange-500 placeholder-gray-500 resize-none"
                  rows={3}
                  disabled={isCaptionLoading}
                />
              </div>
              {isCaptionLoading && (
                <div className="text-center text-sm text-orange-300 animate-pulse">
                  Conjuring spooky captions from the netherworld...
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleNext}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  isCaptionLoading || !title.trim() || !description.trim()
                }
              >
                {isCaptionLoading ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    Next Step <FaArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )
      case 4:
        return cloudinaryUrl ? (
          <div className="space-y-4">
            <CloudinaryBackgroundReplace
              imageUrl={cloudinaryUrl}
              onBackgroundReplaced={handleBackgroundReplaced}
            />
            {/*<Button onClick={handleSkip} className="w-full mt-4">
              Skip Background Replacement
            </Button>*/}
          </div>
        ) : (
          <div>Error: No Cloudinary URL available</div>
        )
      case 5:
        return (
          <Card className="w-full max-w-sm mx-auto bg-gray-900 shadow-lg border-orange-500 border">
            <CardHeader>
              <h3 className="text-lg font-semibold text-orange-300">
                Uploading Your Spooky Creation
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-center text-gray-300">
                {uploadProgress < 100
                  ? `Uploading: ${Math.round(uploadProgress)}%`
                  : 'Upload complete!'}
              </p>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }, [
    activeStep,
    imageUrl,
    handleFileChange,
    handleNext,
    handleRetake,
    error,
    crop,
    handleCropComplete,
    zoom,
    handleZoomChange,
    croppedImageUrl,
    cloudinaryUrl,
    handleImageEdited,
    title,
    isCaptionLoading,
    description,
    handleBackgroundReplaced,
    uploadProgress,
  ])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-b from-black from-0% via-purple-800 via-30% to-gray-900 to-100% text-gray-100 shadow-2xl shadow-purple-700/30 [box-shadow:rgba(128,0,128,0.6)_0px_0px_10px_3px,rgba(128,0,128,0.3)_0px_4px,rgba(128,0,128,0.2)_0px_8px,rgba(128,0,128,0.1)_0px_11px,rgba(128,0,128,0.05)_0px_18px] backdrop-blur-sm border border-purple-700 ">
        <DialogHeader className="text-center">
          <DialogTitle className="text-3xl text-orange-500 font-black">
            🧙‍♂️ Spooky Uploader
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {steps[activeStep]?.description ||
              'Preparing your spooky creation...'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center mb-6">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`flex items-center ${
                index < steps.length - 1 ? 'w-full' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= activeStep
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                <step.icon />
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 w-full ${
                    index < activeStep ? 'bg-orange-500' : 'bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
