"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Users, UserCheck, CalendarOff, Building2 } from 'lucide-react';
import StatCard from '@/src/components/faculties/StatCard';
import { adminApi } from '@/src/api/admin';
import Header from '@/src/components/faculties/Header';
import TableToolbar from '@/src/components/faculties/TableToolbar';
import FacultyList from '@/src/components/faculties/FacultyList';
import CreateFacultyModal from '@/src/components/faculties/modals/CreateFacultyModal';
import EditFacultyModal from '@/src/components/faculties/modals/EditFacultyModal';
import UploadTimetableModal from '@/src/components/faculties/modals/UploadTimetableModal';
import DeleteConfirmationModal from '@/src/components/faculties/modals/DeleteConfirmationModal';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { Faculty, Department } from '@/src/types/type';
import { toast } from 'sonner';

export default function FacultyManagementPage() {
    // --- STATE --- //
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [isUploading, setIsUploading] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFaculty, setSelectedFaculty] = useState<any>(null);

    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    // --- FETCH DATA --- //
    // Wrapped in useCallback so we can call it after every CRUD operation
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch both at the same time using Promise.all for speed
            const [facultiesRes, departmentsRes] = await Promise.all([
                adminApi.getFaculties(),
                adminApi.getDepartments()
            ]);

            setFaculties(facultiesRes.data);
            setDepartments(departmentsRes.data); // Save the departments
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load data from server.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle '?mode=create' in URL
    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'create') {
            setIsCreateModalOpen(true);
            const params = new URLSearchParams(searchParams.toString());
            params.delete('mode');
            const newRelativePathQuery = pathname + (params.toString() ? `?${params.toString()}` : '');
            router.replace(newRelativePathQuery);
        }
    }, [searchParams, pathname, router]);


    // --- DERIVED STATS --- //
    const stats = useMemo(() => {
        return {
            total: faculties.length,
            active: faculties.filter(f => !f.busy).length,
            busy: faculties.filter(f => f.busy).length, // Live busy status
            departments: departments.length
        };
    }, [faculties, departments]);

    // --- PAGINATION LOGIC --- //
    // Added a filter for searchQuery so search actually works on the frontend!
    const filteredFaculties = faculties.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.email.toLowerCase().includes(searchQuery.toLowerCase())
    ).map(f => {
        // Find department name for the list display
        const dept = departments.find(d => d.id === f.department_id);
        return {
            ...f,
            department: dept ? dept.name : 'Unknown',
            status: (f.busy ? 'Busy' : 'Available') as 'Available' | 'Busy' | 'Retired',
            initials: f.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        };
    });

    const totalPages = Math.ceil(filteredFaculties.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentFaculties = filteredFaculties.slice(startIndex, startIndex + itemsPerPage);

    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));


    // --- ASYNC CRUD FUNCTIONS --- //

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Grab all the data from the form (including the hidden file input!)
        const formData = new FormData(e.target as HTMLFormElement);

        // 2. Prepare the JSON data for the first API call
        const facultyData = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            department_id: parseInt(formData.get('department_id') as string, 10),
            designation: formData.get('designation') as string,
            office: formData.get('office') as string,
            short_code: formData.get('short_code') as string,
        };

        try {
            // STEP A: Create the Faculty
            const createRes = await adminApi.createFaculty(facultyData);
            const newFacultyId = createRes.data.id; // We grab the ID from our backend tweak!

            // STEP B: Check for a file and upload it
            const file = formData.get('file') as File;

            // Note: A blank file input still creates a File object, but its size is 0
            if (file && file.size > 0) {
                const uploadData = new FormData();
                uploadData.append('file', file);

                // Fire the second API call using the new ID
                await adminApi.uploadTimetable(newFacultyId, uploadData);
                console.log("Timetable uploaded successfully!");
            }

            // STEP C: Clean up the UI
            setIsCreateModalOpen(false);
            await fetchData(); // Refresh the table
            setCurrentPage(1);

            // Show them the auto-generated password!
            alert(`Faculty created successfully!\nTemporary Password: ${createRes.data.password}`); // Keeping alert here as password needs copy capability, but using toast as well
            toast.success("Faculty created successfully!");

        } catch (error: any) {
            console.error("Error creating faculty:", error);
            toast.error(error.response?.data?.detail || "Failed to create faculty");
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        const facultyData = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            department_id: parseInt(formData.get('department_id') as string, 10),
            designation: formData.get('designation') as string,
            office: formData.get('office') as string,
            short_code: formData.get('short_code') as string,
        };

        try {
            await adminApi.updateFaculty(selectedFaculty.id, facultyData);
            setIsEditModalOpen(false);
            await fetchData();
            toast.success("Faculty updated successfully!");
        } catch (error: any) {
            console.error("Error updating faculty:", error);
            toast.error(error.response?.data?.detail || "Failed to update faculty");
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await adminApi.deleteFaculty(selectedFaculty.id);
            setIsDeleteModalOpen(false);
            await fetchData(); // Refresh table

            // Fix pagination if we deleted the last item on the current page
            if (currentFaculties.length === 1 && currentPage > 1) {
                setCurrentPage(currentPage - 1);
            }
            toast.success("Faculty deleted successfully!");
        } catch (error: any) {
            console.error("Error deleting faculty:", error);
            toast.error(error.response?.data?.detail || "Failed to delete faculty");
        }
    };

    // Note: You will need to build an upload timetable endpoint on the backend later!
    const handleTimetableUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const file = formData.get('file') as File;

        if (!file) return toast.error("Please select a file");

        const uploadData = new FormData();
        uploadData.append('file', file);

        // This relies on the endpoint we discussed earlier: /api/admin/faculty/upload-slots?faculty_id=X
        try {
            await adminApi.uploadTimetable(selectedFaculty.id, uploadData);
            setIsUploadModalOpen(false);
            toast.success(`Timetable uploaded successfully for ${selectedFaculty.name}`);
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Failed to upload timetable");
        }
    };

    const handleBulkUpload = async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await adminApi.uploadBulkFaculties(formData);
            await fetchData();
            setCurrentPage(1);

            const createdFaculties = response.data.created_faculty || [];
            const createdCount = createdFaculties.length;
            const skipped = response.data.skipped_rows || [];
            
            let message = `Successfully uploaded ${createdCount} faculties.`;

            // If we created new faculties, download their credentials automatically
            if (createdCount > 0) {
                const csvHeader = "Email,Temporary Password\n";
                const csvRows = createdFaculties.map((f: any) => `${f.email},${f.password}`).join("\n");
                const csvContent = csvHeader + csvRows;
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.setAttribute('hidden', '');
                a.setAttribute('href', url);
                a.setAttribute('download', `faculty_credentials_${new Date().toISOString().split('T')[0]}.csv`);
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                message += `\n\nCredentials CSV has been downloaded. Please share these with the faculty.`;
            }

            if (skipped.length > 0) {
                message += `\n\nSkipped ${skipped.length} rows:`;
                skipped.forEach((s: any) => {
                    message += `\n- Row ${s.row}: ${s.name || 'Unknown'} (${s.reason})`;
                });
            }
            alert(message); // Kept as alert for detailed multiline reading
            toast.success(`Processed bulk upload`);

        } catch (error: any) {
            console.error("Error bulk uploading:", error);
            toast.error(error.response?.data?.detail || "Failed to process bulk upload.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">

            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total Faculty" value={stats.total} icon={Users} color="bg-blue-50 text-blue-600" />
                <StatCard title="Available" value={stats.active} icon={UserCheck} color="bg-emerald-50 text-emerald-600" />
                <StatCard title="Busy Mode" value={stats.busy} icon={CalendarOff} color="bg-amber-50 text-amber-600" />
                <StatCard title="Departments" value={stats.departments} icon={Building2} color="bg-indigo-50 text-indigo-600" />
            </div>

            {/* Header & Create Button */}
            <Header
                setIsCreateModalOpen={setIsCreateModalOpen}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                handleBulkUpload={handleBulkUpload}
                isUploading={isUploading}
            />

            {/* Main Data Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                <TableToolbar />

                {isLoading ? (
                    <div className="p-10 text-center text-slate-500">Loading faculties...</div>
                ) : (
                    <FacultyList
                        currentFaculties={currentFaculties}
                        startIndex={startIndex}
                        itemsPerPage={itemsPerPage}
                        totalPages={totalPages}
                        currentPage={currentPage}
                        searchQuery={searchQuery}
                        faculties={filteredFaculties}
                        handlePrevPage={handlePrevPage}
                        handleNextPage={handleNextPage}
                        setSelectedFaculty={setSelectedFaculty}
                        setIsUploadModalOpen={setIsUploadModalOpen}
                        setIsEditModalOpen={setIsEditModalOpen}
                        setIsDeleteModalOpen={setIsDeleteModalOpen}
                    />
                )}

            </div>

            {/* MODALS */}

            {isCreateModalOpen && (
                <CreateFacultyModal setIsCreateModalOpen={setIsCreateModalOpen} handleCreateSubmit={handleCreateSubmit} departments={departments} />
            )}

            {isEditModalOpen && selectedFaculty && (
                <EditFacultyModal setIsEditModalOpen={setIsEditModalOpen} selectedFaculty={selectedFaculty} handleEditSubmit={handleEditSubmit} />
            )}

            {isUploadModalOpen && selectedFaculty && (
                <UploadTimetableModal setIsUploadModalOpen={setIsUploadModalOpen} selectedFaculty={selectedFaculty} handleTimetableUpload={handleTimetableUpload} />
            )}

            {isDeleteModalOpen && selectedFaculty && (
                <DeleteConfirmationModal setIsDeleteModalOpen={setIsDeleteModalOpen} selectedFaculty={selectedFaculty} handleDeleteConfirm={handleDeleteConfirm} />
            )}

        </div>
    );
}