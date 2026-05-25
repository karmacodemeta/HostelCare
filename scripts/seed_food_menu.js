const mongoose = require('mongoose');

// Schemas manually defined to match
const MealPlanSchema = {
    breakfast: { type: String, default: '' },
    lunch: { type: String, default: '' },
    snacks: { type: String, default: '' },
    dinner: { type: String, default: '' }
};

const MessMenuSchema = new mongoose.Schema(
    {
        hostelId: { type: mongoose.Schema.Types.ObjectId, required: true },
        branchId: { type: mongoose.Schema.Types.ObjectId },
        updatedBy: { type: String },
        monday: MealPlanSchema,
        tuesday: MealPlanSchema,
        wednesday: MealPlanSchema,
        thursday: MealPlanSchema,
        friday: MealPlanSchema,
        saturday: MealPlanSchema,
        sunday: MealPlanSchema,
    },
    { timestamps: true }
);

const MessMenu = mongoose.models.MessMenu || mongoose.model('MessMenu', MessMenuSchema);

async function run() {
    const uri = 'mongodb://localhost:27017/hostel-care';
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB for Mess Menu Seeding!');

        // Delete existing menus to avoid duplicate unique key conflicts
        await MessMenu.deleteMany({});
        console.log('Cleared existing mess menus collection.');

        const hostelId = new mongoose.Types.ObjectId("6a1382bd4a8634ff5495d4cf");
        const branchId = new mongoose.Types.ObjectId("6a13838b4a8634ff5495d554");

        const sampleMenuData = {
            monday: {
                breakfast: "Aloo Paratha with Curd & Hot Ginger Tea",
                lunch: "Chole Bhature with Pulao, Boondi Raita, and Salad",
                snacks: "Samosa with Sweet & Green Chutney and Tea",
                dinner: "Paneer Butter Masala, Tandoori Roti, Jeera Rice, and Kheer"
            },
            tuesday: {
                breakfast: "Indori Poha with Roasted Peanuts, Sev, and Tea",
                lunch: "Arhar Dal Tadka, Kadhi Pakoda, Steamed Rice, Bhindi Bhujia",
                snacks: "Crispy Bread Pakora with Chai",
                dinner: "Egg Curry / Mushroom Masala, Chapati, Plain Rice, and Custard"
            },
            wednesday: {
                breakfast: "Soft Idli Sambar, Coconut Chutney, and Coffee",
                lunch: "Spicy Rajma Masala, Basmati Rice, Onion Salad, and Aloo Gobhi",
                snacks: "Pani Puri / Golgappa (8 pieces)",
                dinner: "Chicken Biryani / Special Veg Pulao, Mirchi Salan, and Raita"
            },
            thursday: {
                breakfast: "Puri Sabzi (Aloo Dum) and Cardamom Tea",
                lunch: "Dal Makhani, Mix Veg Sabzi, Butter Naan, and Jeera Rice",
                snacks: "Hot Veg Cutlet with Tomato Sauce & Tea",
                dinner: "Aloo Gajar Matar Sabzi, Yellow Dal Fry, Tawa Roti, and Gulab Jamun"
            },
            friday: {
                breakfast: "Grilled Veg Sandwich, Tomato Ketchup, and Coffee",
                lunch: "Kashmiri Dum Aloo, Chana Dal, Steamed Rice, and Crisp Papad",
                snacks: "Bihari Aloo Chop / Kachori with Chai",
                dinner: "Fish Curry / Kadai Paneer, Plain Roti, Basmati Rice, and Salad"
            },
            saturday: {
                breakfast: "Uttapam with Tomato Chutney and Hot Tea",
                lunch: "Special Khichdi with Desi Ghee, Baingan Bharta, Papad, Achar, and Dahi",
                snacks: "Steamed Veg Momos with Spicy Red Chutney",
                dinner: "Malai Kofta, Lachha Paratha, Green Peas Pulao, and Vanilla Ice Cream"
            },
            sunday: {
                breakfast: "Chole Bhature, Mixed Pickle, and Sweet Lassi",
                lunch: "Special Shahi Paneer, Dal Fry, Butter Naan, and Jeera Rice",
                snacks: "Gujarati Dhokla with Green Chilli & Tea",
                dinner: "Mutton Curry / Kadhai Paneer, Butter Roti, Basmati Rice, and Suji Halwa"
            }
        };

        // 1. Seed Global Menu
        const globalMenu = new MessMenu({
            hostelId: hostelId,
            branchId: null,
            updatedBy: 'Admin',
            ...sampleMenuData
        });
        await globalMenu.save();
        console.log('Successfully seeded Global Fallback Mess Menu!');

        // 2. Seed Patna Branch Menu
        const patnaMenu = new MessMenu({
            hostelId: hostelId,
            branchId: branchId,
            updatedBy: 'Admin',
            ...sampleMenuData
        });
        await patnaMenu.save();
        console.log('Successfully seeded Patna Branch Mess Menu!');

        console.log('\n--- FOOD MENU SEEDING COMPLETE ---');

    } catch (err) {
        console.error('Mess Menu seeding failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

run();
