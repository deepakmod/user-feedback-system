const express = require('express');
const { z } = require('zod');
const router = express.Router();
const Feedback = require('../models/Feedback');
const rateLimit = require('express-rate-limit');

// Rate limiting configuration
const feedbackLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many submissions from this IP. Try again later.',
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: 'Too many submissions. Please wait 15 minutes.',
        });
    },
});

// Define Zod schema with enhanced validation
const feedbackSchema = z.object({
    userName: z.string()
        .min(1, { message: "User name is required" })
        .max(100, { message: "User name must be 100 characters or less" })
        .trim(),
    email: z.string()
        .email({ message: "Invalid email address" })
        .max(254, { message: "Email must be 254 characters or less" })
        .trim()
        .toLowerCase(),
    feedbackText: z.string()
        .min(1, { message: "Feedback text is required" })
        .max(2000, { message: "Feedback must be 2000 characters or less" })
        .trim(),
    category: z.string()
        .max(50, { message: "Category must be 50 characters or less" })
        .optional()
        .nullable(),
});

// POST /feedback - with rate limiting
router.post('/', feedbackLimiter, async (req, res) => {
    try {
        const validatedData = feedbackSchema.parse(req.body);
        const newFeedback = new Feedback(validatedData);
        await newFeedback.save();

        res.status(201).json({
            success: true,
            data: newFeedback,
            message: 'Thank you for your feedback!'
        });

    } catch (err) {
        // Zod Validation Errors (User Input Issues)
        if (err instanceof z.ZodError) {
            // Transform Zod errors into a more user-friendly format
            const errors = err.errors.map(e => ({
                field: e.path.join('.'),
                message: e.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Please fix the errors in your submission',
                errors: errors
            });
        }

        // Generic Server Error
        console.error('Feedback submission error:', err);
        res.status(500).json({
            success: false,
            message: 'Something went wrong. Please try again later.',
        });
    }
});

// GET /feedback with pagination
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', category } = req.query;
        const skip = (page - 1) * limit;

        // Build query dynamically
        const query = {};
        if (search) {
            query.$or = [
                { userName: { $regex: search, $options: 'i' } },
                { feedbackText: { $regex: search, $options: 'i' } },
            ];
        }
        if (category) query.category = category;

        // Optimized query (single DB call with Promise.all)
        const [total, feedbacks] = await Promise.all([
            Feedback.countDocuments(query),
            Feedback.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean() // Faster read-only response
                .select('-__v') // Exclude version key
        ]);

        res.json({
            success: true,
            data: feedbacks,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / limit),
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to load feedback. Try refreshing the page.'
        });
    }
});

module.exports = router;