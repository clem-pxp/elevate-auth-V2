'use client';

import { motion } from 'motion/react';
import Image from 'next/image';

import { ElevateLogo } from '@/components/logo/elevate-logo';
import { OnboardingForm } from '@/components/onboarding/onboarding-form';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-main md:p-2 md:grid md:grid-cols-2">
      <div className="w-full justify-center flex">
        <div className="px-5 md:px-6 md:py-3 py-5 max-w-[40rem] w-full">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
            <div className="flex flex-col gap-15">
              <ElevateLogo />
              <OnboardingForm />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="hidden md:flex w-full p-8 items-end relative overflow-hidden rounded-16">
        <Image src="/images/signup_banner.png" alt="" fill className="object-cover" />
      </div>
    </div>
  );
}
