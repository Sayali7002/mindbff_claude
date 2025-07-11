'use client';

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface WelcomeScreenProps {
  onNext?: () => void;
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const router = useRouter()

  const handleGetStarted = () => {
    if (onNext) {
      onNext();
    } else {
      router.push('/onboarding/support-preferences');
    }
  };

  const keyFeatures = [
    {
      icon: '👥',
      title: 'Connect with Peers',
      description: 'Instantly match with people who truly understand your journey and experiences.',
    },
    {
      icon: '💬',
      title: 'Empower Your Mind',
      description: 'Engage in meaningful chats, calls, or group discussions with peers who have walked a similar path.',
    },
    {
      icon: '🎭',
      title: 'Anonymous & Safe Space',
      description: 'Share openly in a judgement-free environment, guided by certified and empathetic listeners.',
    },
    {
      icon: '🌍',
      title: 'Instant Support Anytime',
      description: 'Access coping strategies, resources, and peer support whenever you need it—day or night.',
    },
  ];

  const testimonials = [
    { name: "Sarah K.", text: "Happistaa connected me with someone who truly understood my anxiety." },
    { name: "Michael T.", text: "The peer support here is genuine. I finally found people who get what I'm going through." },
    { name: "Priya R.", text: "Having a supportive community during tough times made all the difference." },
  ]

  const dataPoints = [
    { number: "10K+", label: "Happy Users" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "24/7", label: "Support Available" },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 gradient-bg"
    >
      <div className="max-w-md w-full space-y-4 text-center">
        {/* Logo */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex justify-center mb-6"
        >
          <div className="text-3xl font-bold text-gray-900 flex items-center">
          <span className="material-icons text-blue-500 text-4xl mb-2">diversity_2</span>
            <span className="text-4xl mr-2"></span> MindBFF
          </div>
        </motion.div>

        {/* Taglines */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {/* Welcome to Happistaa – */}
            A Friend in Need!
          </h1>
          <p className="text-lg text-gray-700 font-semibold mb-2">
             Emotional copilot to rest, reflect and rise
          </p>
          <p className="text-base text-gray-600 mb-8">
          Show up as your best and productive self
          </p>
        </motion.div>

        {/* Insight Cards */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          className="space-y-6"
        >
          {/* 2x2 Grid for USPs */}
          <div className="grid grid-cols-2 gap-4">
            {keyFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (index * 0.1), duration: 0.3 }}
                className="rounded-3xl p-3 bg-gradient-to-br from-pink-50 to-pink-10 soft-shadow flex flex-col items-center text-center transition-all duration-200 hover:scale-105 hover:shadow-xl border border-blue-100 hover:border-blue-300 ring-1 ring-blue-50"
              >
                {/* Use Material Icons or Heroicons for modern look */}
                {index === 0 && (
                  <span className="material-icons text-blue-500 text-4xl mb-2">diversity_3</span>
                )}
                {index === 1 && (
                  <span className="material-icons text-amber-500 text-4xl mb-2">psychology</span>
                )}
                {index === 2 && (
                  <span className="material-icons text-green-700 text-4xl mb-2">lock</span>
                )}
                {index === 3 && (
                  <span className="material-icons text-yellow-500 text-4xl mb-2">schedule</span>
                )}
                <h3 className="font-semibold text-l text-gray-900 mb-1">{feature.title}</h3>
                {/* <p className="text-sm text-gray-600">{feature.description}</p> */}
              </motion.div>
            ))}
          </div>

          {/* Testimonials */}
         {/*} <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="py-4"
          >
            <div className="flex overflow-x-auto space-x-4 py-1 no-scrollbar">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-lg p-3 shadow-sm min-w-[200px] border-l-4 border-blue-400 flex-shrink-0"
                >
                  <p className="text-xs text-gray-600 italic mb-2">"{testimonial.text}"</p>
                  <span className="text-xs font-medium text-blue-700">- {testimonial.name}</span>
                </div>
              ))}
            </div>
          </motion.div> */}

          {/* Data Points */}
          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-between py-4 bg-white rounded-lg shadow-sm p-4 mb-4"
          >
            {dataPoints.map((point, index) => (
              <div key={index} className="text-center">
                <p className="text-lg font-bold text-blue-700">{point.number}</p>
                <p className="text-sm text-blue-600">{point.label}</p>
              </div>
            ))}
          </motion.div> */}

          <Button
            onClick={handleGetStarted}
            className="w-full py-6 text-lg rounded-full"
          >
            Get Started
          </Button>
          <Button
            onClick={() => router.push('/auth/login')}
            variant="outline"
            className="w-full py-6 text-lg rounded-full"
          >
            I already have an account
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}