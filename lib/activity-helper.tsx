import { Activity, User, CreditCard, Building2, Info, GraduationCap } from 'lucide-react';

export function getActivityIcon(entityType: string) {
    switch (entityType) {
        case 'Student': return <User className="w-5 h-5 text-blue-500" />;
        case 'Expense': return <CreditCard className="w-5 h-5 text-red-500" />;
        case 'Branch': return <Building2 className="w-5 h-5 text-purple-500" />;
        case 'Payment': return <CreditCard className="w-5 h-5 text-green-500" />; // Added Payment icon
        default: return <Info className="w-5 h-5 text-gray-500" />;
    }
}

export function formatActivityMessage(activity: any) {
    const { action, details, entityType } = activity;
    
    // Improved formatting logic
    if (action === 'BRANCH_CREATED') return `Created branch "${details?.name}"`;
    if (action === 'BRANCH_UPDATED') {
        if (details?.name && typeof details.name === 'object' && details.name.from && details.name.to) {
             return `Renamed branch from "${details.name.from}" to "${details.name.to}"`;
        }
        return `Updated branch details`;
    }
    
    if (action === 'CATEGORY_ADDED') return `Added expense category "${details?.name}"`;
    if (action === 'CATEGORY_DELETED') return `Deleted expense category "${details?.name}"`;
    
    if (action === 'EXPENSE_ADDED') return `Added expense of ₹${details?.amount}`;
    if (action === 'EXPENSE_UPDATED') {
        const changes = [];
        if (details?.amount) changes.push(`Amount: ₹${details.amount.from} → ₹${details.amount.to}`);
        if (details?.category) changes.push(`Category: ${details.category.from} → ${details.category.to}`);
        if (details?.description) changes.push(`Desc updated`);
        
        if (changes.length > 0) return `Updated expense: ${changes.join(', ')}`;
        return `Updated expense record`;
    }
    
    if (action === 'STUDENT_ADDED') return `Added student "${details?.name}"`;
    if (action === 'STUDENT_UPDATED') return `Updated student "${details?.name}"`;
    
    if (action === 'RENT_COLLECTED') {
        if (details?.students && Array.isArray(details.students)) {
            const names = details.students.map((s: any) => s.name).join(', ');
            // Truncate if too long (e.g. > 3 names)
            if (details.students.length > 3) {
                 const firstThree = details.students.slice(0, 3).map((s: any) => s.name).join(', ');
                 return `Collected ₹${details.totalAmount} from ${details.count} students: ${firstThree} +${details.count - 3} more`;
            }
            return `Collected ₹${details.totalAmount} from ${names}`;
        }
        return `Collected ₹${details?.totalAmount} from ${details?.count} students`;
    }
    
    // Fallback for purely text descriptions or unknown actions
    if (details?.description && typeof details.description === 'string') return details.description;
    
    return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l: string) => l.toUpperCase());
}
