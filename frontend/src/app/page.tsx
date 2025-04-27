import type { Metadata } from 'next'
import FeedbackDashboard from "@/components/FeedbackDashboard";

export const metadata: Metadata = {
    title: 'Feedback Portal',
    description: 'Share your feedback with us. We value your opinions and suggestions to help us improve.',
    keywords: ['feedback', 'survey', 'customer feedback', 'suggestions'],
}

export default function Home() {
    return (
        <FeedbackDashboard />
    )
}