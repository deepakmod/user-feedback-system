"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import {MonthlyStats} from "@/components/FeedbackDashboard";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
    ssr: false,
});

export default function MonthlyFeedbackChart({data}:{data:MonthlyStats[]}) {
    const options: ApexOptions = {
        colors: ["#465fff"],
        chart: {
            fontFamily: "Outfit, sans-serif",
            type: "bar",
            height: 180,
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: "39%",
                borderRadius: 5,
                borderRadiusApplication: "end",
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            show: true,
            width: 4,
            colors: ["transparent"],
        },
        xaxis: {
            categories: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ],
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
        },
        legend: {
            show: true,
            position: "top",
            horizontalAlign: "left",
            fontFamily: "Outfit",
        },
        yaxis: {
            title: {
                text: undefined,
            },
        },
        grid: {
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        fill: {
            opacity: 1,
        },

        tooltip: {
            x: {
                show: false,
            },
            y: {
                formatter: (val: number) => `${val}`,
            },
            theme: "light",
            custom: ({ series, seriesIndex, dataPointIndex, w }) => {
                return `<div class="bg-white text-gray-900 px-2 py-1 rounded-md shadow-sm">
                  ${w.globals.labels[dataPointIndex]}: ${series[seriesIndex][dataPointIndex]}
                </div>`;
            }
        },
    };
    const series = [
        {
            name: "Feedbacks",
            data: data.length ? data.map((item:MonthlyStats)=>item.count):[],
        },
    ];

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-[#18181B] sm:px-6 sm:pt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Monthly Feedbacks
            </h3>

            <div className="max-w-full overflow-x-auto custom-scrollbar">
                <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
                    <ReactApexChart
                        options={options}
                        series={series}
                        type="bar"
                        height={180}
                    />
                </div>
            </div>
        </div>
    );
}
