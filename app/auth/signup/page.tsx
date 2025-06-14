"use client"

import { useActionState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Eye, EyeOff, Mail, Lock, User, Calendar, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { signUpAction, type SignUpFormState } from "@/app/actions/auth"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [ageRange, setAgeRange] = useState("")
  const [state, formAction, isPending] = useActionState<SignUpFormState, FormData>(signUpAction, {})
  const router = useRouter()

  // Redirect on successful signup
  useEffect(() => {
    if (state.success) {
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    }
  }, [state.success, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-primary-500 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">MindTune</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join MindTune</h1>
          <p className="text-gray-600">Start your journey to better mental wellness</p>
        </div>

        {/* Success Message */}
        {state.success && (
          <Alert className="mb-6 border-primary-200 bg-primary-50">
            <CheckCircle className="h-4 w-4 text-primary-600" />
            <AlertDescription className="text-primary-800">
              {state.message} Redirecting to dashboard...
            </AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {state.errors?._form && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{state.errors._form[0]}</AlertDescription>
          </Alert>
        )}

        {/* Sign Up Form */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center">Create Account</CardTitle>
            <CardDescription className="text-center">Fill in your details to get started</CardDescription>
          </CardHeader>

          <CardContent>
            <form action={formAction} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                  {state.errors?.firstName && <p className="text-sm text-red-600">{state.errors.firstName[0]}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" type="text" placeholder="Doe" className="h-12" required />
                  {state.errors?.lastName && <p className="text-sm text-red-600">{state.errors.lastName[0]}</p>}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    className="pl-10 h-12"
                    required
                  />
                </div>
                {state.errors?.email && <p className="text-sm text-red-600">{state.errors.email[0]}</p>}
              </div>

              {/* Age Field */}
              <div className="space-y-2">
                <Label htmlFor="ageRange">Age Range</Label>
                <Select name="ageRange" onValueChange={setAgeRange}>
                  <SelectTrigger className="h-12">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="Select your age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-25">18-25 years</SelectItem>
                    <SelectItem value="26-35">26-35 years</SelectItem>
                    <SelectItem value="36-45">36-45 years</SelectItem>
                    <SelectItem value="46-55">46-55 years</SelectItem>
                    <SelectItem value="56-65">56-65 years</SelectItem>
                    <SelectItem value="65+">65+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {state.errors?.password && <p className="text-sm text-red-600">{state.errors.password[0]}</p>}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {state.errors?.confirmPassword && (
                  <p className="text-sm text-red-600">{state.errors.confirmPassword[0]}</p>
                )}
              </div>

              {/* Terms and Newsletter */}
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox id="agreeToTerms" name="agreeToTerms" required />
                  <Label htmlFor="agreeToTerms" className="text-sm text-gray-600 leading-5">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary-600 hover:text-primary-700">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {state.errors?.agreeToTerms && <p className="text-sm text-red-600">{state.errors.agreeToTerms[0]}</p>}

                <div className="flex items-start space-x-2">
                  <Checkbox id="subscribeNewsletter" name="subscribeNewsletter" />
                  <Label htmlFor="subscribeNewsletter" className="text-sm text-gray-600">
                    Subscribe to our wellness newsletter for tips and updates
                  </Label>
                </div>
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white"
                disabled={isPending}
              >
                {isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/signin" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Need help? Contact our{" "}
            <Link href="/support" className="text-primary-600 hover:text-primary-700">
              support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
