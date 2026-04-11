export interface Faculty {
    id: string;
    name: string;
    email: string;           
    department_id: number;
    department: string;
    designation: string;
    office: string;
    busy: boolean;
    status: 'Available' | 'Busy' | 'Retired';
    initials: string;
}

export interface Department {
    id: number;      
    name: string;   
    code: string;    // Mocked for UI (derived from name)
    head: string;    // Mocked for UI (Not in DB schema yet)
    count: number;   // Mocked for UI (Not in DB schema yet)
    status: string;  // Mocked for UI (Not in DB schema yet)
}

export interface Student {
    id: number;         
    roll_number: string; 
    name: string;
    initials: string;
    email: string;
    noShowCount: number; // Mocked for UI (Not in DB schema yet)
    status: string;      // Mocked for UI (Not in DB schema yet)
    adminIntervention: boolean; // Mocked for UI
}