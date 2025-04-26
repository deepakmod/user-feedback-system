import type { Metadata } from 'next'
import FeedbackForm from "@/components/FeedbackForm";

export const metadata: Metadata = {
    title: 'Feedback Form',
    description: 'Share your feedback with us. We value your opinions and suggestions.',
    keywords: ['feedback', 'survey', 'customer feedback', 'suggestions'],
    openGraph: {
        title: 'Feedback Form',
        description: 'Help us improve by sharing your thoughts',
    }
}

export default function FeedbackPage() {
    return (
        <main className={"w-full h-screen py-12 px-4 sm:px-6 lg:px-8 bg-[#27272A]"}>
            <div className="p-8 shadow-lg rounded-lg max-w-2xl mx-auto bg-[#18181B]">
                <h1 className="text-3xl font-bold text-center mb-6">Share Your Feedback</h1>
                <p className="text-lg mb-8 text-center text-gray-600">
                    We&apos;d love to hear your thoughts, suggestions, or concerns.
                </p>
                <FeedbackForm />
            </div>
        </main>
    )
}