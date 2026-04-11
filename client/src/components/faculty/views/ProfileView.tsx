"use client";

import { Card, CardContent } from "@/components/ui/Card";
import {
  User,
  Mail,
  Briefcase,
  MapPin,
  Hash,
  BookOpen,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/store/hooks";
import AuthGuard from "@/components/AuthGuard";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { facultyApi } from "@/api/faculty.api";
import { FacultyProfile } from "@/types/faculty";

export default function ProfileView() {
  const { signOut } = useAuth();
  const { user: authUser, loading } = useAppSelector((state) => state.auth);
  
  const [profile, setProfile] = useState<FacultyProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    designation: "",
    office: "",
    short_code: "",
    keywords: [] as string[],
  });
  const [newKeyword, setNewKeyword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
     facultyApi.getProfile().then(res => {
         setProfile(res.data);
         setIsLoadingProfile(false);
     });
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await facultyApi.updateProfile(editForm);
      setProfile(res.data);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
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

  if (loading || isLoadingProfile || !profile || !authUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : authUser.email.charAt(0).toUpperCase() || "FA";

  return (
    <AuthGuard>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pb-20 lg:pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              My Profile
            </h1>
            <p className="text-gray-500 mt-1">
              View your academic and account details.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={signOut}
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 hidden lg:flex"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="w-full">
            <Card className="overflow-hidden border-none shadow-lg">
              <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                <div className="absolute -bottom-12 left-8">
                  <div className="w-24 h-24 bg-white rounded-2xl border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                    {authUser.picture ? (
                      <img
                        src={authUser.picture}
                        alt={profile.name || "Profile"}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-2xl">
                        {initials}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <CardContent className="pt-16 pb-8 px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="w-full sm:w-auto">
                    {isEditing ? (
                      <Input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="text-lg font-bold h-8 mb-1 w-full sm:w-64"
                      />
                    ) : (
                      <h2 className="text-2xl font-bold text-gray-900">
                        {profile.name || "Faculty User"}
                      </h2>
                    )}
                    
                    {isEditing ? (
                      <Input
                        value={editForm.designation}
                        onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                        className="h-8 mt-2 w-full sm:w-64 text-sm"
                        placeholder="Designation"
                      />
                    ) : (
                       <p className="text-blue-600 font-medium mt-1">
                         {profile.designation ? profile.designation : "NITC Faculty"}
                       </p>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                      <Button variant="outline" className="bg-white flex-1 sm:flex-none" onClick={() => setIsEditing(false)} disabled={isSaving}>
                        Cancel
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" className="shrink-0 bg-white w-full sm:w-auto mt-4 sm:mt-0" onClick={() => {
                        setEditForm({
                          name: profile?.name || "",
                          designation: profile?.designation || "",
                          office: profile?.office || "",
                          short_code: profile?.short_code || "",
                          keywords: profile?.keywords || [],
                        });
                        setIsEditing(true);
                      }}>
                      Edit Profile
                    </Button>
                  )}
                </div>

                <hr className="my-8 border-gray-100" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="font-semibold text-gray-900 border-l-4 border-blue-600 pl-2">
                      Professional Details
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <Hash className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="w-full">
                          <p className="text-sm text-gray-500">Faculty Code</p>
                          {isEditing ? (
                            <Input
                              value={editForm.short_code}
                              onChange={(e) => setEditForm({ ...editForm, short_code: e.target.value })}
                              placeholder="e.g. EMP123"
                              className="h-8 mt-1 max-w-[200px]"
                            />
                          ) : (
                             <p className="font-medium text-gray-900">
                               {profile.short_code || "Not Assigned"}
                             </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="w-full">
                          <p className="text-sm text-gray-500">
                            Office Location
                          </p>
                          {isEditing ? (
                            <Input
                              value={editForm.office}
                              onChange={(e) => setEditForm({ ...editForm, office: e.target.value })}
                              placeholder="e.g. IT Building Rank 1"
                              className="h-8 mt-1 max-w-[200px]"
                            />
                          ) : (
                            <p className="font-medium text-gray-900">
                              {profile.office || "Not Specified"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="font-semibold text-gray-900 border-l-4 border-blue-600 pl-2">
                       Department & Contact
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Department</p>
                          <p className="font-medium text-gray-900">
                            {profile.department_name || authUser.department || "NITC"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Institute Email</p>
                          <p className="font-medium text-gray-900">
                            {profile.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <hr className="my-8 border-gray-100" />
                
                <div className="space-y-4">
                   <h3 className="font-semibold text-gray-900 border-l-4 border-blue-600 pl-2 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" /> Research Keywords
                   </h3>
                   
                   {isEditing && (
                       <div className="flex gap-2 max-w-sm mb-4">
                          <Input
                            placeholder="Add keyword (Enter)"
                            value={newKeyword}
                            onChange={e => setNewKeyword(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleAddKeyword() }}
                          />
                          <Button type="button" variant="outline" onClick={handleAddKeyword}>Add</Button>
                       </div>
                   )}
                   
                   <div className="flex flex-wrap gap-2">
                       {(!isEditing ? (profile.keywords || []) : (editForm.keywords || [])).map(kw => (
                           <span key={kw} className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-sm font-medium flex items-center gap-1">
                               {kw}
                               {isEditing && (
                                   <button type="button" onClick={() => handleRemoveKeyword(kw)} className="text-red-400 hover:text-red-600 font-bold ml-1">×</button>
                               )}
                           </span>
                       ))}
                       {(!profile.keywords || profile.keywords.length === 0) && !isEditing && (
                           <span className="text-sm text-gray-400 italic">No keywords added yet.</span>
                       )}
                   </div>
                </div>
                
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
