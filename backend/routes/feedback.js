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


router.get('/stats', async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();

        // 1. Total unique users (based on email)
        const totalUsers = await Feedback.distinct('email').then(emails => emails.length);

        const totalFeedbacks = await Feedback.countDocuments();

        // 2. Category-wise feedback count
        const categoryStats = await Feedback.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $project: { _id: 0, category: '$_id', count: 1 } }
        ]);

        // 3. Monthly feedback count for current year only
        const monthlyStats = await Feedback.aggregate([
            {
                $match: {
                    timestamp: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lt: new Date(`${currentYear + 1}-01-01`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$timestamp' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Generate all months for current year with 0 counts
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        const completeMonthlyStats = monthNames.map((monthName, index) => {
            const monthNumber = index + 1;
            const monthData = monthlyStats.find(s => s._id === monthNumber);
            return {
                year: currentYear,
                month: monthNumber,
                monthName,
                count: monthData ? monthData.count : 0
            };
        });

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalFeedbacks,
                categories: categoryStats,
                monthly: completeMonthlyStats,
            }
        });

    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to load stats. Try again later.'
        });
    }
});

module.exports = router;