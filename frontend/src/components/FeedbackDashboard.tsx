"use client";

import React, {useEffect, useState} from 'react';
import InfoCard from "@/components/InfoCard";
import MonthlyFeedbackChart from "@/components/MonthlyFeedbackChart";
import FeedbackPieChart from "@/components/FeedbackPieChart";
import FeedbackTable from "@/components/FeedbackTable";
import axios from "axios";

export interface CategoryStats {
    count: number;
    category: string;
}

export interface MonthlyStats {
    year: number;
    month: number;
    monthName: string;
    count: number;
}

export interface StatsResponse {
    totalUsers: number;
    totalFeedbacks: number;
    categories: CategoryStats[];
    monthly: MonthlyStats[];
}


function FeedbackDashboard() {

    const [stats, setStats] = useState<StatsResponse | null>(null);

    const fetchStats = async () => {
        try {
            const response = await axios.get(process.env.NEXT_PUBLIC_BACKEND_API_URL+'/feedback/stats');
            setStats(response.data.stats);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6 p-6 bg-[#27272A] h-screen overflow-y-auto">
            <div className="col-span-12 space-y-6 xl:col-span-7">
                <InfoCard totalUsers={ stats?.totalUsers ?? 0} totalFeedbacks={stats?.totalFeedbacks ?? 0} />
                <MonthlyFeedbackChart data={stats?.monthly ?? []} />
            </div>
            <div className="col-span-12 xl:col-span-5">
                <FeedbackPieChart data={stats?.categories ?? []} />
            </div>
            <div className="col-span-12">
                <FeedbackTable />
            </div>
        </div>
    );
}

export default FeedbackDashboard;