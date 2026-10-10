import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Input } from '../components/ui/Input'
import { LockIcon, MailIcon, UserIcon } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useApp } from '../context/AppContext'

const Login = ({ mode = 'login' }) => {
  const { login, register } = useApp()
  const isRegister = mode === 'register'
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const ok = isRegister ? await register(form.name, form.email, form.password) : await login(form.email, form.password)

    setIsLoading(false)
    if (ok) navigate('/')
  }
  return (
    <div className='min-h-screen text-zinc-900 flex flex-col md:flex-row '>
      {/* left Hero brand */}
      <div className='md:w-1/2 p-8 md:p-12 lg:p-16 bg-linear-to-br from-orange-50 via-zinc-100 to-red-50 border-b md:border-b-0 md:border-r border-zinc-200 flex flex-col justify-between relative overflow-hidden'>
        <div className='absolute inset-0 bg-[url("/pattern.svg")]'></div>
        <div className='relative z-10 flex items-center gap-3'>
          <img src="/logo.svg" alt="Drivea Logo" className='max-h-9' />
          <span className='text-4xl font-medium uppercase text-zinc-900'> Drivea</span>
        </div>
        <div className='relative z-10 my-12 space-y-6'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl tracking-tight text-zinc-900'>Secure, Simple and Fast <br /> <span className='text-orange-600'>Cloud Storage</span></h2>
          <p className='text-sm md:text-base text-zinc-600 max-w-md leading-relaxed'>Store your files securely in our drive, oragnize into folders, share with permissions and access anywhere</p>
        </div>
        <div className='relative z-10 text-sm text-zinc-500'>
          © 2026 Drivea. All rights reserverd.
        </div>
      </div>



      {/* right auth form  */}
      <div className='md:w-1/2 p-8 md:p-12 lg:p-16 flex items-center justify-center bg-white'>
        <div className='w-full max-w-md space-y-6 animate-fade-in'>
          <div>
            <h3 className='text-2xl font-medium text-zinc-900'>{isRegister ? "Creare an Account" : "Welcome back"}</h3>
            <p className='text-sm text-zinc-500 mt-1'>{isRegister ? "Enter your dettails below to get started with 1 GB free storage" : "Enter you credentials to access your Drive"}</p>
          </div>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {isRegister && (
              <Input label='Full Name' icon={UserIcon} placeholder="Jhon Doe"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            )}

            <Input
              label='Email Address'
              type='email'
              icon={MailIcon}
              placeholder="your@example.com"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
            />

            <Input
              label='Password'
              type='password'
              icon={LockIcon}
              // add bullet symbol
              placeholder="********"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              required
            />
            <Button type='submit' variant='primary' className='w-full py-3' isLoading={isLoading}>
              <span className='font-medium text-base'>
                {isRegister ? "Register Account" : "Sign In"}
              </span>
            </Button>
          </form>
          <div className='text-center pt-2'>
            {isRegister ? (
              <p>Already have an account? {" "}<Link to='/login' className='text-orange-600 font-semibold'>Sign in here</Link> </p>
            ) : (
              <p>Don't have account yet? {" "}<Link to='/register' className='text-orange-600 font-semibold'>Create account</Link> </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login