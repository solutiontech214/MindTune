"use server"

import { redirect } from "next/navigation"
import { createUser, authenticateUser, findUserByEmail, createUserSession } from "@/lib/auth"
import { setSessionCookie, logoutUser } from "@/lib/session"
import { z } from "zod"

// Sign up form schema
const SignUpSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters") // Reduced from 8 for easier testing
      .regex(/[a-zA-Z]/, "Password must contain at least one letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    ageRange: z.string().optional(),
    agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms"),
    subscribeNewsletter: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

// Sign in form schema
const SignInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export type SignUpFormState = {
  errors?: {
    firstName?: string[]
    lastName?: string[]
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
    ageRange?: string[]
    agreeToTerms?: string[]
    _form?: string[]
  }
  success?: boolean
  message?: string
}

export type SignInFormState = {
  errors?: {
    email?: string[]
    password?: string[]
    _form?: string[]
  }
  success?: boolean
  message?: string
}

export async function signUpAction(prevState: SignUpFormState, formData: FormData): Promise<SignUpFormState> {
  try {
    console.log("Sign up action started")

    // Validate form data
    const validatedFields = SignUpSchema.safeParse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      ageRange: formData.get("ageRange"),
      agreeToTerms: formData.get("agreeToTerms") === "on",
      subscribeNewsletter: formData.get("subscribeNewsletter") === "on",
    })

    if (!validatedFields.success) {
      console.log("Validation failed:", validatedFields.error.flatten().fieldErrors)
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { firstName, lastName, email, password, ageRange, subscribeNewsletter } = validatedFields.data

    console.log("Creating user for email:", email)

    // Check if user already exists
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      console.log("User already exists")
      return {
        errors: {
          email: ["An account with this email already exists"],
        },
      }
    }

    // Create new user
    const newUser = await createUser({
      firstName,
      lastName,
      email,
      password,
      ageRange,
      subscribeNewsletter,
    })

    if (!newUser) {
      console.log("Failed to create user")
      return {
        errors: {
          _form: ["Failed to create account. Please try again."],
        },
      }
    }

    console.log("User created successfully, creating session")

    // Create session
    const sessionToken = await createUserSession(newUser.id)
    if (!sessionToken) {
      console.log("Failed to create session")
      return {
        errors: {
          _form: ["Account created but failed to sign in. Please try signing in manually."],
        },
      }
    }

    // Set session cookie
    await setSessionCookie(sessionToken)

    console.log("Sign up completed successfully")

    return {
      success: true,
      message: "Account created successfully!",
    }
  } catch (error) {
    console.error("Sign up error:", error)
    return {
      errors: {
        _form: ["An unexpected error occurred. Please try again."],
      },
    }
  }
}

export async function signInAction(prevState: SignInFormState, formData: FormData): Promise<SignInFormState> {
  try {
    console.log("Sign in action started")

    // Validate form data
    const validatedFields = SignInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    })

    if (!validatedFields.success) {
      console.log("Validation failed:", validatedFields.error.flatten().fieldErrors)
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { email, password } = validatedFields.data

    console.log("Authenticating user:", email)

    // Authenticate user
    const user = await authenticateUser(email, password)

    if (!user) {
      console.log("Authentication failed")
      return {
        errors: {
          _form: ["Invalid email or password"],
        },
      }
    }

    console.log("User authenticated, creating session")

    // Create session
    const sessionToken = await createUserSession(user.id)
    if (!sessionToken) {
      console.log("Failed to create session")
      return {
        errors: {
          _form: ["Failed to create session. Please try again."],
        },
      }
    }

    // Set session cookie
    await setSessionCookie(sessionToken)

    console.log("Sign in completed successfully")

    return {
      success: true,
      message: "Signed in successfully!",
    }
  } catch (error) {
    console.error("Sign in error:", error)
    return {
      errors: {
        _form: ["An unexpected error occurred. Please try again."],
      },
    }
  }
}

export async function signOutAction(): Promise<void> {
  await logoutUser()
  redirect("/")
}
