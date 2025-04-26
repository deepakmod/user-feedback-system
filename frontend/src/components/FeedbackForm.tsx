"use client";
import {useEffect, useState} from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Button,
    Input,
    Select,
    Textarea,
    Alert,
    SelectItem,
} from '@heroui/react';
import axios from "axios";

const notJustWhitespace = (value: string) => value.trim().length > 0;

const feedbackSchema = z.object({
    userName: z.string()
        .min(1, { message: "User name is required" })
        .max(100, { message: "User name must be 100 characters or less" })
        .refine(notJustWhitespace, { message: "User name cannot be just spaces" }),
    email: z.string()
        .email({ message: "Invalid email address" })
        .max(254, { message: "Email must be 254 characters or less" })
        .refine(notJustWhitespace, { message: "Email cannot be just spaces" }),
    feedbackText: z.string()
        .min(1, { message: "Feedback text is required" })
        .max(2000, { message: "Feedback must be 2000 characters or less" })
        .refine(notJustWhitespace, { message: "Feedback cannot be just spaces" }),
    category: z.string()
        .max(50, { message: "Category must be 50 characters or less" })
        .optional()
        .nullable(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

type BackendError = {
    message: string;
    errors?: Array<{
        field: string;
        message: string;
    }>;
};

export default function FeedbackForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [backendErrors, setBackendErrors] = useState<BackendError | null>(null);

    const feedbackCategories = [
        { key: 'general', label: 'General Feedback' },
        { key: 'bug', label: 'Bug Report' },
        { key: 'feature', label: 'Feature Request' },
        { key: 'ui', label: 'UI/UX Improvement' },
        { key: 'performance', label: 'Performance Issue' },
        { key: 'suggestion', label: 'Suggestion' },
        { key: 'content', label: 'Content Feedback' },
        { key: 'accessibility', label: 'Accessibility Issue' },
        { key: 'security', label: 'Security Concern' },
        { key: 'other', label: 'Other' }
    ] as const;

    const {
        control,
        handleSubmit,
        reset,
        setError,
        formState: { errors },
    } = useForm<FeedbackFormData>({
        mode: 'onChange',
        resolver: zodResolver(feedbackSchema),
        defaultValues: {
            userName: '',
            email: '',
            feedbackText: '',
            category: null,
        }
    });

    const onSubmit = async (data: FeedbackFormData) => {
        setIsSubmitting(true);
        setBackendErrors(null);

        try {
            await axios.post(process.env.NEXT_PUBLIC_BACKEND_API_URL+'/feedback', data);
            setSubmitSuccess(true);
            reset();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.data) {
                    const backendError = error.response.data as BackendError;
                    setBackendErrors(backendError);

                    if (backendError.errors) {
                        backendError.errors.forEach((err) => {
                            setError(err.field as keyof FeedbackFormData, {
                                type: 'server',
                                message: err.message
                            });
                        });
                    }
                } else {
                    setBackendErrors({
                        message: error.message || 'Failed to submit feedback. Please try again.'
                    });
                }
            } else if (error instanceof Error) {
                setBackendErrors({
                    message: error.message || 'An unknown error occurred'
                });
            } else {
                setBackendErrors({
                    message: 'An unknown error occurred'
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if(submitSuccess){
            setTimeout(() => {
                setSubmitSuccess(false);
            }, 5000);
        }
    }, [submitSuccess]);

    const getErrorMessage = (fieldName: keyof FeedbackFormData) => {
        return errors[fieldName]?.message;
    };

    return (
       <>
            {submitSuccess && (
                <Alert className="mb-6 rounded-md" color="success">
                    Thank you for your feedback! We appreciate your input.
                </Alert>
            )}

            {backendErrors?.message && (
                <Alert className="mb-6 rounded-md" color="danger">
                    {backendErrors.message}
                </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                    <Controller
                        name="userName"
                        control={control}
                        render={({ field }) => (
                            <Input
                                id="userName"
                                label="Your Name*"
                                labelPlacement="outside"
                                placeholder="Enter your name"
                                errorMessage={getErrorMessage('userName')}
                                isInvalid={!!getErrorMessage('userName')}
                                className="w-full"
                                {...field}
                            />
                        )}
                    />

                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <Input
                                id="email"
                                label="Email Address*"
                                labelPlacement="outside"
                                type="email"
                                placeholder="Enter your email"
                                errorMessage={getErrorMessage('email')}
                                isInvalid={!!getErrorMessage('email')}
                                className="w-full"
                                {...field}
                            />
                        )}
                    />

                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <Select
                                id="category"
                                label="Feedback Category"
                                labelPlacement="outside"
                                placeholder="Select a category"
                                className="w-full"
                                selectedKeys={field.value ? [field.value] : []}
                                onSelectionChange={(keys) => {
                                    const value = Array.from(keys)[0] as string | null;
                                    field.onChange(value);
                                }}
                                errorMessage={getErrorMessage('category')}
                                isInvalid={!!getErrorMessage('category')}
                            >
                                {feedbackCategories.map((category) => (
                                    <SelectItem key={category.key}>
                                        {category.label}
                                    </SelectItem>
                                ))}
                            </Select>
                        )}
                    />

                    <Controller
                        name="feedbackText"
                        control={control}
                        render={({ field }) => (
                            <Textarea
                                id="feedbackText"
                                label="Your Feedback*"
                                labelPlacement="outside"
                                placeholder="Share your thoughts with us..."
                                rows={3}
                                errorMessage={getErrorMessage('feedbackText')}
                                isInvalid={!!getErrorMessage('feedbackText')}
                                className="w-full"
                                {...field}
                            />
                        )}
                    />

                    <Button
                        type="submit"
                        size="lg"
                        color={"secondary"}
                        className="w-full"
                        isLoading={isSubmitting}
                        isDisabled={isSubmitting}
                    >
                        Submit Feedback
                    </Button>
                </form>
       </>
    );
}