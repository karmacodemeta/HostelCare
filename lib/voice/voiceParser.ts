
interface ParsedStudentData {
    name?: string;
    rent?: string;
    roomNo?: string;
    contactNumber?: string;
    advanceAmount?: string;
}

export function parseVoiceInput(transcript: string): ParsedStudentData {
    console.log("Parsing voice input:", transcript);
    const lower = transcript.toLowerCase();
    const data: ParsedStudentData = {};

    // --- Helper Regex Patterns ---
    // Matches "word value" or "value word" patterns roughly

    // 1. RENT / KIRAYA
    // Look for Rent/Kiraya followed by a number
    const rentRegex = /(?:rent|kiraya|amount|price).*?(\d+)/i;
    const rentMatch = lower.match(rentRegex);
    if (rentMatch) {
        data.rent = rentMatch[1];
    }

    // 2. ROOM / KAMRA
    // Look for Room/Kamra followed by alpha-numeric (e.g., 101, A2, 303)
    const roomRegex = /(?:room|kamra|number|kaksha).*?(\w+)/i;
    const roomMatch = lower.match(roomRegex);
    if (roomMatch) {
        // Validation: Room number shouldn't be too long (avoid capturing sentences)
        if (roomMatch[1].length < 6) {
            data.roomNo = roomMatch[1];
        }
    }

    // 3. PHONE / MOBILE
    // Look for 10 consecutive digits, ignoring spaces/dashes
    const phoneRegex = /(\d{10})|(\d{5}\s\d{5})/;
    const phoneMatch = lower.match(phoneRegex);
    if (phoneMatch) {
        data.contactNumber = phoneMatch[0].replace(/\s/g, '');
    }

    // 4. ADVANCE / DEPOSIT
    const advanceRegex = /(?:advance|deposit|security).*?(\d+)/i;
    const advanceMatch = lower.match(advanceRegex);
    if (advanceMatch) {
        data.advanceAmount = advanceMatch[1];
    }

    // 5. NAME / NAAM
    // This is the hardest part. Heuristic:
    // a) Look for "name is [X]" or "naam [X] hai"
    // b) If not found, look for "student [X]"
    // c) If typically starts with name: "Add student [X]"

    // Strategy: explicit markers first
    const nameMarkers = /(?:name is|naam|student|called)\s+([a-z\s]+?)(?:\s+(?:room|rent|kiraya|kamra|phone|mobile|and|ka)|$)/i;
    const nameMatch = lower.match(nameMarkers);

    if (nameMatch && nameMatch[1]) {
        // Clean up: remove "hai" or common fillers if captured
        let name = nameMatch[1].replace(/\b(hai|ka|ki)\b/g, '').trim();
        if (name.length > 2) {
            data.name = capitalizeName(name);
        }
    }

    // Fallback: If we have room/rent but no name, maybe the FIRST few words are the name?
    if (!data.name) {
        // Remove known patterns (rent 5000, room 101) from string
        let remnant = lower
            .replace(rentRegex, '')
            .replace(roomRegex, '')
            .replace(phoneRegex, '')
            .replace(advanceRegex, '')
            .replace(/add|new|student|hai|ka|ki/g, '') // remove command words
            .trim();

        // Take the first 2-3 words as name if meaningful
        const words = remnant.split(/\s+/).filter(w => w.length > 2);
        if (words.length > 0 && words.length <= 3) {
            data.name = capitalizeName(words.join(' '));
        }
    }

    return data;
}

function capitalizeName(name: string) {
    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
