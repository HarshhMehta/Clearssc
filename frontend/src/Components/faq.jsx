"use client"

import { useState } from "react"

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: "What is a whole body MRI and why might I need one?",
      answer:
        "A whole body MRI is a non-invasive imaging technique that can help detect potential health issues throughout the body. This can be particularly useful for preventative care or for individuals with a family history of certain conditions.",
    },
    {
      question: "Is a Screening MRI safe?",
      answer:
        "Yes, MRI scans are generally considered safe. However, individuals with certain medical implants or conditions may not be able to undergo an MRI. Our team will discuss your medical history before scheduling your appointment to ensure your safety.",
    },
    {
      question: "How long does a Screening MRI take?",
      answer:
        "The length of an MRI scan can vary depending on the type of scan and other factors. However, most scans take between 30 minutes to an hour.",
    },
    {
      question: "Do I need a referral to schedule a Screening MRI",
      answer:
        "We accept referrals from your doctor (referral form); however, a referral is not necessary. Simply book a service and one of our physicians will ensure you are eligible for the scan.",
    },
    {
      question: "How do I schedule an appointment?",
      answer:
        "You can book online" ,
    },
    
  ]

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-16 px-4 bg-[#141B31]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Find answers to common questions about our services, process, and policies. Can't find what you're looking
            for? Feel free to contact us.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-white/20 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <button
                className="w-full px-6 py-5 text-left bg-white/10 hover:bg-white/20 transition-colors duration-200 flex justify-between items-center"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                <div className="flex-shrink-0">
                  <svg
                    className={`w-5 h-5 text-gray-300 transition-transform duration-200 ${
                      openIndex === index ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 py-5 bg-white/5 border-t border-white/10">
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

       
      </div>
    </section>
  )
}
