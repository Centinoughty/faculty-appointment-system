interface Faculty {
    id: string;
    name: string;
    dept: string;
    designation: string;
    office: string;
    status: 'Active' | 'On Leave' | 'Retired';
    initials: string;
}


export const generateMockData = () => {
    const depts = ['Computer Science', 'Electrical Eng.', 'Mathematics', 'Physics', 'Mechanical Eng.', 'Civil Engineering', 'Architecture'];
    const desigs = ['Professor', 'Associate Professor', 'Assistant Professor'];
    const names = ['John Smith', 'Jane Doe', 'Robert Brown', 'Amit Kumar', 'Sarah Parker', 'Rahul Verma', 'Emily Chen', 'Michael Chang', 'Priya Singh', 'David Wilson'];

    return Array.from({ length: 42 }, (_, i) => {
        const isLeave = i % 7 === 0; // Roughly 1 in 7 on leave
        const name = `${i % 2 === 0 ? 'Dr.' : i % 3 === 0 ? 'Mr.' : 'Ms.'} ${names[i % names.length]} ${i + 1}`;
        const initials = name.split(' ').slice(1, 3).map(n => n[0]).join('').toUpperCase();

        return {
            id: `fac-${i + 1}`,
            name: name,
            initials: initials,
            dept: depts[i % depts.length],
            designation: desigs[i % desigs.length],
            office: `${depts[i % depts.length].substring(0, 3).toUpperCase()}-${100 + i}`,
            status: isLeave ? 'On Leave' : 'Active'
        } as Faculty;
    });
};