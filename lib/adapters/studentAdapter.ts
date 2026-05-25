export interface RawStudentInput {
    name: string;
    contactNumber: string; // Added
    guardian: string;
    guardianContact?: string; // Added
    address: string;
    roomNo: string;
    admissionDate?: string | Date; // Added
    rent: string | number;
    advanceAmount?: string | number; // Added
    dues: string | number;
    branchId?: string;
}

export interface StudentData {
    name: string;
    contactNumber: string;
    guardian: string;
    guardianContact?: string;
    address: string;
    roomNo: string;
    admissionDate: Date;
    rent: number;
    advanceAmount: number;
    dues: number;
    isActive: boolean; // Explicitly added
    branchId?: string;
}

/**
 * Adapter Pattern: Decouples the input source (Form, JSON, Excel) from the Database Schema.
 * Currently handles basic Form Data.
 * Future: Can be extended to parse natural language or CSV rows.
 */
export function adaptStudentInput(input: RawStudentInput): StudentData {
    // Basic validation and type conversion
    return {
        name: input.name?.trim(),
        contactNumber: input.contactNumber?.trim(),
        guardian: input.guardian?.trim(),
        guardianContact: input.guardianContact?.trim(),
        address: input.address?.trim(),
        roomNo: input.roomNo?.trim(),
        admissionDate: input.admissionDate ? new Date(input.admissionDate) : new Date(),
        rent: Number(input.rent) || 0,
        advanceAmount: Number(input.advanceAmount) || 0,
        dues: Number(input.dues) || 0,
        isActive: true, // Force true on creation
        branchId: input.branchId,
    };
}
