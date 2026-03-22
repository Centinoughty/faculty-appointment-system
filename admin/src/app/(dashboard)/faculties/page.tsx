"use client";

import React, { useState, useMemo } from 'react';
import { Users, UserCheck, CalendarOff, Building2 } from 'lucide-react';
import StatCard from '@/src/components/faculties/StatCard';
import { generateMockData } from '@/src/lib/dummy';
import Header from '@/src/components/faculties/Header';
import TableToolbar from '@/src/components/faculties/TableToolbar';
import FacultyList from '@/src/components/faculties/FacultyList';
import CreateFacultyModal from '@/src/components/faculties/modals/CreateFacultyModal';
import EditFacultyModal from '@/src/components/faculties/modals/EditFacultyModal';
import UploadTimetableModal from '@/src/components/faculties/modals/UploadTimetableModal';
import DeleteConfirmationModal from '@/src/components/faculties/modals/DeleteConfirmationModal';

export default function FacultyManagementPage() {
    // --- STATE --- //
    const [faculties, setFaculties] = useState(generateMockData());
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [selectedFaculty, setSelectedFaculty] = useState<any>(null);

    // --- DERIVED STATS --- //
    const stats = useMemo(() => {
        return {
            total: faculties.length,
            active: faculties.filter(f => f.status === 'Active').length,
            onLeave: faculties.filter(f => f.status === 'On Leave').length,
            departments: new Set(faculties.map(f => f.dept)).size
        };
    }, [faculties]);

    // --- PAGINATION LOGIC --- //
    const totalPages = Math.ceil(faculties.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentFaculties = faculties.slice(startIndex, startIndex + itemsPerPage);

    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
    const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

    // --- DUMMY CRUD FUNCTIONS --- //
    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const name = formData.get('name') as string;

        const newFaculty = {
            id: `fac-${Date.now()}`,
            name: name,
            initials: name.split(' ').slice(1, 3).map(n => n[0])?.join('').toUpperCase() || 'XX',
            dept: formData.get('dept') as string,
            designation: formData.get('desig') as string,
            office: formData.get('office') as string,
            status: 'Active' as const
        };

        setFaculties([newFaculty, ...faculties]);
        setIsCreateModalOpen(false);
        setCurrentPage(1);
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);

        setFaculties(faculties.map(fac => {
            if (fac.id === selectedFaculty.id) {
                return {
                    ...fac,
                    name: formData.get('name') as string,
                    dept: formData.get('dept') as string,
                    desig: formData.get('desig') as string,
                    office: formData.get('office') as string,
                };
            }
            return fac;
        }));
        setIsEditModalOpen(false);
    };

    const handleDeleteConfirm = () => {
        setFaculties(faculties.filter(fac => fac.id !== selectedFaculty.id));
        setIsDeleteModalOpen(false);

        if (currentFaculties.length === 1 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleTimetableUpload = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, handle file upload here via API
        console.log(`Uploading timetable for ${selectedFaculty?.name}`);
        setIsUploadModalOpen(false);
        alert(`Timetable uploaded successfully for ${selectedFaculty?.name}`);
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">

            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard title="Total Faculty" value={stats.total} icon={Users} color="bg-blue-50 text-blue-600" />
                <StatCard title="Active Now" value={stats.active} icon={UserCheck} color="bg-emerald-50 text-emerald-600" />
                <StatCard title="On Leave" value={stats.onLeave} icon={CalendarOff} color="bg-amber-50 text-amber-600" />
                <StatCard title="Departments" value={stats.departments} icon={Building2} color="bg-indigo-50 text-indigo-600" />
            </div>

            {/* Header & Create Button */}
            <Header setIsCreateModalOpen={setIsCreateModalOpen} />

            {/* Main Data Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden">
                <TableToolbar />

                <FacultyList
                    currentFaculties={currentFaculties}
                    startIndex={startIndex}
                    itemsPerPage={itemsPerPage}
                    totalPages={totalPages}
                    currentPage={currentPage}
                    faculties={faculties}
                    handlePrevPage={handlePrevPage}
                    handleNextPage={handleNextPage}
                    setSelectedFaculty={setSelectedFaculty}
                    setIsUploadModalOpen={setIsUploadModalOpen}
                    setIsEditModalOpen={setIsEditModalOpen}
                    setIsDeleteModalOpen={setIsDeleteModalOpen} />

            </div>

            {/* MODALS */}

            {isCreateModalOpen && (
                <CreateFacultyModal setIsCreateModalOpen={setIsCreateModalOpen} handleCreateSubmit={handleCreateSubmit} />
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