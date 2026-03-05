"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '../../lib/db'
import { supabase } from '../../lib/supabaseClient'
import toast from 'react-hot-toast'

export default function LoginPage() {
    const router = useRouter()
    const [isSignUp, setIsSignUp] = useState(false)
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        if (isSignUp) {
            const { error, data } = await signUp(email, password, fullName)
            if (error) {
                toast.error(error.message || 'Signup failed')
                setLoading(false)
            } else {
                toast.success('Account created successfully!')
                // Refresh the router to push to the secured dashboard
                setTimeout(() => {
                    router.push('/')
                    window.location.reload()
                }, 1000)
            }
        } else {
            const { error } = await signIn(email, password)
            if (error) {
                toast.error(error.message || 'Login failed')
                setLoading(false)
            } else {
                toast.success('Login successful!')
                router.push('/')
                window.location.reload()
            }
        }
    }

    const handleResetPassword = async () => {
        if (!email) {
            toast.error("Please enter your email to reset password")
            return
        }
        const { error } = await supabase.auth.resetPasswordForEmail(email)
        if (error) toast.error(error.message)
        else toast.success("Password reset email sent!")
    }

    return (
        <div className="min-h-screen bg-[#F3F3F3] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center text-3xl font-bold tracking-tight text-[#032D60]">
                    ProMarketer<span className="text-[#06A59A]">.</span>
                </h1>
                <h2 className="mt-4 text-center text-xl font-semibold text-[#181818]">
                    {isSignUp ? 'Create a new account' : 'Sign in to your team workspace'}
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-[#E5E5E5]">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-medium text-[#444444] uppercase tracking-wide text-[11px]">
                                    Full Name
                                </label>
                                <div className="mt-1">
                                    <input
                                        type="text"
                                        required={isSignUp}
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#0176D3] focus:outline-none focus:ring-[#0176D3] sm:text-sm"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-[#444444] uppercase tracking-wide text-[11px]">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#0176D3] focus:outline-none focus:ring-[#0176D3] sm:text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#444444] uppercase tracking-wide text-[11px]">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-[#0176D3] focus:outline-none focus:ring-[#0176D3] sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {!isSignUp && (
                            <div className="flex items-center justify-end">
                                <div className="text-sm">
                                    <button
                                        type="button"
                                        onClick={handleResetPassword}
                                        className="font-medium text-[#0176D3] hover:text-[#032D60]"
                                    >
                                        Forgot your password?
                                    </button>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex w-full justify-center rounded-md border border-transparent bg-[#0176D3] py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-[#032D60] focus:outline-none focus:ring-2 focus:ring-[#0176D3] focus:ring-offset-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : (isSignUp ? 'Create Account' : 'Sign in')}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center border-t border-gray-200 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm font-medium text-[#444444] hover:text-[#0176D3]"
                        >
                            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
