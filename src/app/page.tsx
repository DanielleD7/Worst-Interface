"use client"

import { useState, useEffect, useRef } from "react"
import { CreditCard, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Confetti from 'react-confetti'

const fieldOptions = [
  { value: "firstName", label: "First Name" },
  { value: "lastName", label: "Last Name" },
  { value: "email", label: "Email" },
  { value: "address", label: "Street Address" },
  { value: "city", label: "City" },
  { value: "state", label: "State" },
  { value: "zipCode", label: "ZIP Code" },
  { value: "country", label: "Country" },
  { value: "cardNumber", label: "Card Number" },
  { value: "expMonth", label: "Expiration Month" },
  { value: "expYear", label: "Expiration Year" },
  { value: "cvv", label: "CVV" },
]

interface FieldTypes {
  [key: string]: string;
}

interface FieldValues {
  [key: string]: string;
}

const gifs = [
  { src: "/vibes-cat.gif", top: "0%", left: "0%" },
  { src: "/kneed-cat.gif", top: "0%", left: "75%" },
  { src: "/crunch-cat.gif", top: "30%", left: "80%" },
  { src: "/maxwell-spinning.gif", top: "35%", left: "5%" },
  { src: "/huh-cat.gif", top: "50%", left: "5%" },
]

export default function ConfusingCheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("credit")
  const [fieldTypes, setFieldTypes] = useState<FieldTypes>({})
  const [fieldValues, setFieldValues] = useState<FieldValues>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogContent, setDialogContent] = useState({ title: "", description: "" })
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 })
  const [missedClicks, setMissedClicks] = useState(0)
  const [showGif, setShowGif] = useState(false)
  const [xButtons, setXButtons] = useState<{ id: number; x: number; y: number; isReal: boolean }[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [showYayPopup, setShowYayPopup] = useState(false)
  const payButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const moveButton = () => {
      const maxX = window.innerWidth - 200 // button width
      const maxY = window.innerHeight - 50 // button height
      const newX = Math.random() * maxX
      const newY = Math.random() * maxY
      setButtonPosition({ x: newX, y: newY })
    }

    const intervalId = setInterval(moveButton, 1000) // Move every second

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (payButtonRef.current && !payButtonRef.current.contains(event.target as Node)) {
        setMissedClicks(prev => {
          const newCount = prev + 1
          if (newCount >= 7) {
            setShowGif(true)
            generateXButtons()
            return 0
          }
          return newCount
        })
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const generateXButtons = () => {
    const buttonCount = Math.floor(Math.random() * 7) + 2 // 2 to 8 buttons
    const newButtons = []
    const realButtonIndex = Math.floor(Math.random() * buttonCount)

    for (let i = 0; i < buttonCount; i++) {
      newButtons.push({
        id: i,
        x: Math.random() * (window.innerWidth - 30),
        y: Math.random() * (window.innerHeight - 30),
        isReal: i === realButtonIndex
      })
    }

    setXButtons(newButtons)
  }

  const handleFieldTypeChange = (field: string, value: string) => {
    setFieldTypes(prev => ({ ...prev, [field]: value }))
  }

  const handleFieldValueChange = (field: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [field]: value }))
  }

  const renderField = (field: string) => (
      <div className="space-y-2">
        <Select onValueChange={(value) => handleFieldTypeChange(field, value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select field type" />
          </SelectTrigger>
          <SelectContent>
            {fieldOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
            placeholder={fieldTypes[field] ? fieldOptions.find(option => option.value === fieldTypes[field])?.label : "Enter value"}
            value={fieldValues[field] || ""}
            onChange={(e) => handleFieldValueChange(field, e.target.value)}
        />
      </div>
  )

  const validateFields = () => {
    const requiredFields = [
      "personalInfo1", "personalInfo2", "personalInfo3",
      "address1", "address2", "address3", "address4", "address5"
    ]
    if (paymentMethod === "credit") {
      requiredFields.push("payment1", "payment2", "payment3", "payment4")
    }

    const missingFields = requiredFields.filter(field => !fieldTypes[field] || !fieldValues[field])
    const uniqueFieldTypes = new Set(Object.values(fieldTypes))

    if (missingFields.length > 0) {
      return `Missing fields: ${missingFields.join(", ")}`
    } else if (uniqueFieldTypes.size !== Object.keys(fieldTypes).length) {
      return "Duplicate field types detected"
    }
    return null
  }

  const handleAttemptPay = () => {
    const validationError = validateFields()
    if (validationError) {
      setDialogContent({
        title: "Payment Failed",
        description: validationError
      })
    } else {
      setDialogContent({
        title: "Payment Successful",
        description: "Your order has been processed successfully!"
      })
      setShowConfetti(true)
    }
    setDialogOpen(true)
    setMissedClicks(0)
  }

  const handleXButtonClick = (buttonId: number, isReal: boolean) => {
    if (isReal) {
      setShowGif(false)
      setXButtons([])
    } else {
      setXButtons(prev => prev.filter(button => button.id !== buttonId))
    }
  }

  const handleTryAgain = () => {
    setFieldTypes({})
    setFieldValues({})
    setDialogOpen(false)
  }

  const handlePayAgain = () => {
    setShowConfetti(false);
    setTimeout(() => setShowConfetti(true), 50);
    setShowYayPopup(true);
  }

  return (
      <div className="container mx-auto p-4 relative min-h-screen background-image">
        {/* Stationary Background GIFs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {gifs.map((gif, index) => (
              <img
                  key={index}
                  src={gif.src}
                  alt={`Background GIF ${index + 1}`}
                  className="absolute"
                  style={{
                    top: gif.top,
                    left: gif.left,
                  }}
              />
          ))}
        </div>

        <Card className="max-w-2xl mx-auto relative z-20">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">
              <img src="/pop-cat.gif" alt="Pop Cat Gif" className="inline-block"/>
              {Array.from("Welcome To Checkout").map((char, index) => (
                  <span
                      key={index}
                      className="inline-block"
                      style={{
                        animation: `rainbow-text 5s linear ${index * 0.1}s infinite`,
                      }}
                  >
                {char}
              </span>
              ))}
              <img src="/cat-kiss.gif" alt="Cat Kiss Gif" className="inline-block"/>
            </CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                {renderField("personalInfo1")}
                {renderField("personalInfo2")}
              </div>
              {renderField("personalInfo3")}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Shipping Address</h3>
              {renderField("address1")}
              <div className="grid grid-cols-2 gap-4">
                {renderField("address2")}
                {renderField("address3")}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {renderField("address4")}
                {renderField("address5")}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Information</h3>
              <RadioGroup defaultValue="credit" onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit" id="credit" />
                  <Label htmlFor="credit">Credit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paypal" id="paypal" />
                  <Label htmlFor="paypal">PayPal</Label>
                </div>
              </RadioGroup>

              {paymentMethod === "credit" && (
                  <div className="space-y-4">
                    {renderField("payment1")}
                    <div className="grid grid-cols-3 gap-4">
                      {renderField("payment2")}
                      {renderField("payment3")}
                      {renderField("payment4")}
                    </div>
                  </div>
              )}

              {paymentMethod === "paypal" && (
                  <div className="space-y-4 items-center">
                    <img src="/ratchet-cat.gif" alt="Ratchet Cat Gif"/>
                  </div>
              )}


            </div>
          </CardContent>
        </Card>

        <Button
            ref={payButtonRef}
            className="fixed w-48 animate-color-change z-30"
            style={{
              top: `${buttonPosition.y}px`,
              left: `${buttonPosition.x}px`,
              transition: 'all 0.5s ease-in-out',
            }}
            onClick={handleAttemptPay}
        >
          <CreditCard className="mr-2 h-4 w-4" /> Attempt to Pay
        </Button>

        {showGif && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
              <img src="/haha-cat.gif" alt="Haha Cat Gif" className="w-80 h-80" />
              {xButtons.map((button) => (
                  <Button
                      key={button.id}
                      className="absolute text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center"
                      style={{
                        top: `${button.y}px`,
                        left: `${button.x}px`,
                      }}
                      onClick={() => handleXButtonClick(button.id, button.isReal)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
              ))}
            </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className={dialogContent.title === "Payment Failed" ? "bg-red-600 text-white" : "bg-green-600 text-white"}>
            <DialogHeader>
              <DialogTitle>
                {dialogContent.title}
              </DialogTitle>
              <DialogDescription className={dialogContent.title === "Payment Failed" ? "text-red-100" : "text-green-100"}>
                {dialogContent.description}
              </DialogDescription>
            </DialogHeader>
            {dialogContent.title === "Payment Failed" ? (
                <div className="flex justify-end space-x-2">
                  <Button onClick={() => setDialogOpen(false)} variant="secondary" className="bg-yellow-500">Continue</Button>
                  <Button onClick={handleTryAgain} variant="default" className="bg-green-800">Try Again</Button>
                </div>
            ) : (
                <div className="flex justify-end space-x-2">
                  <Button onClick={() => setDialogOpen(false)} variant="secondary">
                    <X className="mr-2 h-4 w-4" />
                    Close
                  </Button>
                  <Button onClick={handlePayAgain} variant="default">Pay Again</Button>
                </div>
            )}
          </DialogContent>
        </Dialog>

        {showConfetti && (
            <div className="fixed inset-0 z-[9999]">
              <Confetti
                  recycle={false}
                  numberOfPieces={200}
                  onConfettiComplete={() => {
                    setTimeout(() => setShowConfetti(false), 7000);
                  }}
              />
            </div>
        )}

        <Dialog open={showYayPopup} onOpenChange={setShowYayPopup}>
          <DialogContent className="bg-transparent border-none shadow-none flex items-center justify-center">
            <div className="animate-rainbow-bg p-8 rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-6xl font-bold text-white">
                  YAY!!
                </DialogTitle>
              </DialogHeader>
            </div>
          </DialogContent>
        </Dialog>

        <style jsx global>{`
          @keyframes color-change {
            0% { background-color: #3b82f6; }
            25% { background-color: #ef4444; }
            50% { background-color: #22c55e; }
            75% { background-color: #eab308; }
            100% { background-color: #3b82f6; }
          }
          .animate-color-change {
            animation: color-change 5s linear infinite;
          }
          @keyframes rainbow-text {
            0% { color: #ff0000; }
            14% { color: #ff7f00; }
            28% { color: #ffff00; }
            42% { color: #00ff00; }
            57% { color: #0000ff; }
            71% { color: #8b00ff; }
            85% { color: #ff00ff; }
            100% { color: #ff0000; }
          }
          .animate-rainbow {
            animation: rainbow-text 2s linear infinite;
          }
          @keyframes rainbow-bg {
            0% { background-color: #ff0000; }
            14% { background-color: #ff7f00; }
            28% { background-color: #ffff00; }
            42% { background-color: #00ff00; }
            57% { background-color: #0000ff; }
            71% { background-color: #8b00ff; }
            85% { background-color: #ff00ff; }
            100% { background-color: #ff0000; }
          }
          .animate-rainbow-bg {
            animation: rainbow-bg 2s linear infinite;
          }
        `}</style>
      </div>
  )
}