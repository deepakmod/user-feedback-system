'use client';
import { AgGridReact } from 'ag-grid-react';
import { useEffect, useState } from 'react';
import type { ColDef } from 'ag-grid-community';
import { colorSchemeDarkBlue } from 'ag-grid-community';
import { themeQuartz } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import axios from "axios";
import {Button, Pagination} from "@heroui/react";
import { format } from 'date-fns';
import {LuExternalLink} from "react-icons/lu";
import { useRouter } from 'next/navigation'

export interface RowData {
    userName: string;
    email: string;
    feedbackText: string;
    category: string;
    timestamp: string;
}

ModuleRegistry.registerModules([AllCommunityModule]);
const myTheme = themeQuartz.withPart(colorSchemeDarkBlue);

const GridComponent = () => {
    const router = useRouter()
    const [rowData, setRowData] = useState<RowData[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState<string>('');

    const columnDefs:ColDef[] = [
        { field: 'userName', headerName: 'User Name', flex: 1, sortable: true, filter: true },
        { field: 'email', headerName: 'Email', flex: 1, sortable: true, filter: true },
        { field: 'feedbackText', headerName: 'Feedback', flex: 1, sortable: true, filter: true },
        { field: 'category', headerName: 'Category', flex: 1, sortable: true, filter: true },
        {
            field: 'timestamp',
            headerName: 'Submitted At',
            flex: 1,
            sortable: true,
            filter: true,
            valueFormatter: (params) => {
                if (!params.value) return '';
                return format(new Date(params.value), 'dd MMM yyyy, hh:mm a');
            }
        },
    ]
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchFeedback(currentPage, debouncedSearch);
    }, [currentPage, debouncedSearch]);

    const fetchFeedback = async (page: number, search: string) => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/feedback`, {
                params: {
                    page,
                    search,
                },
            });
            console.log(response.data);
            setRowData(response.data.data);
            setTotalPages(response.data.pagination.totalPages || 1);
        } catch (error) {
            console.error('Error fetching feedback:', error);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className={"w-full dark:bg-[#18181B] rounded-xl p-6"}>
            <div className={"flex gap-4 flex-wrap justify-between pb-4"}>
                <h3 className={" text-3xl font-semibold"}>User Feedbacks</h3>
                <Button  onPress={() => router.push('/feedback')} color="primary">
                    <LuExternalLink size={22} />
                    <span>Go To Feedback Form</span>
                </Button>
            </div>

            {/* Search Input */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search feedback..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-[#2C2C2F] dark:text-white"
                />
            </div>

            {/* Grid */}
            <div style={{ height: '51.9vh' }}>
                <AgGridReact theme={myTheme} rowData={rowData} columnDefs={columnDefs} />
            </div>

            {/* Pagination */}
            <div className="flex justify-end mt-4">
                <Pagination
                    showControls
                    initialPage={currentPage}
                    total={totalPages}
                    onChange={handlePageChange}
                />
            </div>
        </div>
    );
};

export default GridComponent;
