import React, { useState } from "react";
import { Mail, Briefcase, MapPin, Hash, BookOpen, X } from "lucide-react";
import { toast } from "sonner";

export default function ProfileView() {
    const [profile, setProfile] = useState({
        name: "Dr. Alan Turing",
        title: "Associate Professor",
        email: "a.turing@nitc.ac.in",
        location: "IT Lab 102",
        department: "Computer Science & Engineering",
        employeeId: "EMP90210",
        keywords: ["Artificial Intelligence", "Cryptography", "Theory of Computation", "Machine Learning"]
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState(profile);
    const [newKeyword, setNewKeyword] = useState("");

    const handleOpenEdit = () => {
        setEditForm(profile);
        setNewKeyword("");
        setIsEditModalOpen(true);
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        setProfile(editForm);
        toast.success("Profile updated successfully!");
        setIsEditModalOpen(false);
    };

    const handleAddKeyword = () => {
        if (newKeyword.trim() && !editForm.keywords.includes(newKeyword.trim())) {
            setEditForm({
                ...editForm,
                keywords: [...editForm.keywords, newKeyword.trim()]
            });
            setNewKeyword("");
        }
    };

    const handleRemoveKeyword = (kwToRemove: string) => {
        setEditForm({
            ...editForm,
            keywords: editForm.keywords.filter(kw => kw !== kwToRemove)
        });
    };
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    Faculty Profile
                </h1>
                <button
                    onClick={handleOpenEdit}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium shadow-sm hover:bg-gray-50 transition text-gray-700"
                >
                    Edit Profile
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Card */}
                <div className="md:col-span-2 glass rounded-2xl p-6 lg:p-8">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center border-b border-gray-200 pb-6 mb-6">
                        <div className="h-24 w-24 rounded-full bg-gray-100 border border-gray-200 p-1 shrink-0 flex items-center justify-center">
                            <div className="h-full w-full rounded-full overflow-hidden bg-white">
                                <img
                                    src={"https://api.dicebear.com/7.x/notionists/svg?seed=Alan"}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                            <p className="text-blue-700 font-medium text-lg">{profile.title}</p>
                            <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {profile.email}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-blue-600" /> Research Keywords
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.keywords.map(kw => (
                                    <span key={kw} className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-sm font-medium">
                                        {kw}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side Info */}
                <div className="space-y-6">
                    <div className="glass rounded-2xl p-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Department Info</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Department</p>
                                    <p className="text-sm text-gray-500">{profile.department}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 text-gray-700 rounded-lg">
                                    <Hash className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Employee ID</p>
                                    <p className="text-sm text-gray-500">{profile.employeeId}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {
                isEditModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                                    <p className="text-sm text-gray-500">Update your personal and professional information.</p>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto flex-1 space-y-6">
                                <form id="edit-profile-form" onSubmit={handleSaveProfile} className="space-y-6">
                                    {/* Basic Info Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Basic Info</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                                <input required type="text" value={editForm.name} onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                                <input required type="text" value={editForm.title} onChange={e => setEditForm(prev => ({ ...prev, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                                <input required type="email" value={editForm.email} onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Office Location</label>
                                                <input required type="text" value={editForm.location} onChange={e => setEditForm(prev => ({ ...prev, location: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Department Info Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Department & ID</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                                <input required type="text" value={editForm.department} onChange={e => setEditForm(prev => ({ ...prev, department: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                                                <input required type="text" value={editForm.employeeId} onChange={e => setEditForm(prev => ({ ...prev, employeeId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Research Keywords Section */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2">Research Keywords</h3>

                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newKeyword}
                                                onChange={e => setNewKeyword(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddKeyword();
                                                    }
                                                }}
                                                placeholder="Add a new keyword (press Enter)"
                                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddKeyword}
                                                className="px-4 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition"
                                            >
                                                Add
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {editForm.keywords.length === 0 && (
                                                <span className="text-sm text-gray-400 italic">No keywords added yet.</span>
                                            )}
                                            {editForm.keywords.map(kw => (
                                                <span key={kw} className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-sm font-medium flex items-center gap-1 group">
                                                    {kw}
                                                    <button type="button" onClick={() => handleRemoveKeyword(kw)} className="text-gray-400 hover:text-red-500 focus:outline-none rounded-full p-0.5 ml-1">
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 bg-white border border-gray-300 rounded-lg transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" form="edit-profile-form" className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
