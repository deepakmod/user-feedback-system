'use client';
import React, {useEffect} from 'react';
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import {CategoryStats} from "@/components/FeedbackDashboard";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

function FeedbackPieChart({data}:{data:CategoryStats[]}) {

    const [seriesData, setSeriesData] = React.useState<number[]>([]);
    const  [seriesDataSet, setSeriesDataSet] = React.useState<string[]>([]);

    function snakeToNormalCase(str: string): string {
        if (!str) return str;

        return str
            .split('_')
            .map(word =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(' ');
    }

    useEffect(() => {
        const series  = data.map((item:CategoryStats)=>item.count);
        setSeriesData( data.length ? series:[] );
        const feedbackCategoryLabels = data.length ? data.map((item:CategoryStats)=>snakeToNormalCase(item.category)):[];
        setSeriesDataSet(feedbackCategoryLabels);
    },[data])


    const options:ApexOptions = {
        chart: {
            width: 380,
            type: 'pie',
        },
        labels: seriesDataSet,
        legend: {
            labels: {
                colors: Array(seriesDataSet.length).fill('#ffffff'), // white text color
                useSeriesColors: false,
            },
            fontSize: '16px',
        },
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    position: 'bottom'
                }
            }
        }]
    };

    const [isClient, setIsClient] = React.useState(false);


    useEffect(() => {
        setIsClient(true);
    }, []);

    return(
        <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-[#18181B]">
            <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-[#18181B] sm:px-6 sm:pt-6">
                <div className="flex justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Feedback by Category
                        </h3>
                        <p className="mt-1 font-normal text-gray-500 text-theme-sm dark:text-gray-400">
                            Distribution of user feedback across categories
                        </p>
                    </div>
                </div>
                <div className="relative ">
                    <div className="max-h-[330px]">
                        {
                            isClient ? <ReactApexChart
                                key={JSON.stringify(seriesData)}
                                options={options}
                                series={seriesData}
                                type="pie"
                                height={330}
                            /> : <></>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FeedbackPieChart;