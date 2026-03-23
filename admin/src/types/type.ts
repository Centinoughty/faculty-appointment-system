export interface Faculty {
    id: string;
    name: string;
    department: string;
    designation: string;
    office: string;
    status: 'Active' | 'On Leave' | 'Retired';
    initials: string;
}
