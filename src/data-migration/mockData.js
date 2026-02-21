const getDateAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

// HELPER: Generate random number between min and max
const getRandom = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// 1. Super Admin
export const mockSuperAdmin = {
    id: "settings",
    email: "admin@gmail.com",
    password: "12345678",
    name: "Super Admin",
    type: "superadmin",
    address: "lahore",
    bio: "bio abc",
    phone: "3012345678",
    imageUrl: "https://link.thelocalrent.com/v?t=1771430742&tk=37160f2e00721d906831565829ae1de7",
};

// 2. Salon Managers (2 managers)
export const mockSalonManagers = [
    { id: "manager-1", email: "salon1@manager.com", password: "12345678", name: "Hassan Ameer", salonId: "salon-1", type: "salonmanager", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop" },
    { id: "manager-2", email: "salon2@manager.com", password: "12345678", name: "Alex Rivera", salonId: "salon-2", type: "salonmanager", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop" }
];

// 3. Salons (2 salons)
export const mockSalons = [
    { id: "salon-1", name: "Elegance Platinum", managerId: "manager-1" },
    { id: "salon-2", name: "Urban Style Studio", managerId: "manager-2" }
];

// 4. Products (Static definitions, totals calculated later)
const baseProducts = [
    // Salon 1
    { id: "p1-1", name: "Silk Shampoo", price: 30, salonId: "salon-1", category: "Shampoo", active: true, imageUrl: "https://images.unsplash.com/photo-1585232351009-aa87416fca90?w=300", brand: "LuxeCare", sku: "LC-VS-01", description: "Premium silk-infused shampoo", inventory: 50 },
    { id: "p1-2", name: "Shine Conditioner", price: 35, salonId: "salon-1", category: "Conditioner", active: true, imageUrl: "https://images.unsplash.com/photo-1552046122-03184de85e08?w=300", brand: "LuxeCare", sku: "LC-GC-02", description: "Enriched with gold minerals", inventory: 40 },
    { id: "p1-3", name: "Repair Mask", price: 50, salonId: "salon-1", category: "Treatment", active: true, imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=300", brand: "PureGlow", sku: "PG-AT-03", description: "Intensive repair mask", inventory: 25 },
    // Salon 2
    { id: "p2-1", name: "Volume Spray", price: 25, salonId: "salon-2", category: "Styling", active: true, imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=300", brand: "StreetStyle", sku: "SS-VS-04", description: "Instant lift and volume", inventory: 60 },
    { id: "p2-2", name: "Matte Clay", price: 20, salonId: "salon-2", category: "Styling", active: true, imageUrl: "https://images.unsplash.com/photo-1599426184804-5ec8f37f201d?w=300", brand: "StreetStyle", sku: "SS-MC-05", description: "High hold matte finish", inventory: 45 },
    { id: "p2-3", name: "Texture Paste", price: 22, salonId: "salon-2", category: "Styling", active: true, imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150", brand: "StreetStyle", sku: "SS-TP-06", description: "Flexible hold texture", inventory: 30 }
];

// 5. Stylists (Static definitions, totals calculated later)
const baseStylists = [
    { id: "s1-1", name: "Emma Johnson", email: "emma@elegance.com", salonId: "salon-1", status: "Active", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop", bio: "Expert colorist", skills: "Balayage, Color" },
    { id: "s1-2", name: "Michael Chen", email: "michael@elegance.com", salonId: "salon-1", status: "Active", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop", bio: "Precision cutter", skills: "Short Hair, Fades" },
    { id: "s1-3", name: "Sarah Williams", email: "sarah@elegance.com", salonId: "salon-1", status: "Active", imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop", bio: "Bridal specialist", skills: "Updos, Styling" },
    { id: "s2-1", name: "David Martinez", email: "david@urban.com", salonId: "salon-2", status: "Active", imageUrl: "https://images.unsplash.com/photo-1492562080023-ab3dbdf5bb3d?w=150&h=150&fit=crop", bio: "Urban stylist", skills: "Modern Cuts" },
    { id: "s2-2", name: "Lisa Anderson", email: "lisa@urban.com", salonId: "salon-2", status: "Active", imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop", bio: "Texture expert", skills: "Perms, Curls" },
    { id: "s2-3", name: "James Wilson", email: "james@urban.com", salonId: "salon-2", status: "Active", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop", bio: "Trends specialist", skills: "Fashion Colors" }
];

// Data Structures for tracking totals to ensure consistency
const stylistTotals = {};
const productTotals = {};

baseStylists.forEach(s => stylistTotals[s.id] = { sales: 0, units: 0 });
baseProducts.forEach(p => productTotals[p.id] = { revenue: 0, units: 0 });

const clients = [];
const recs = [];
const sales = [];

baseStylists.forEach((stylist) => {
    const clientCount = getRandom(2, 5);
    for (let i = 1; i <= clientCount; i++) {
        const clientId = `c-${stylist.id}-${i}`;
        const clientName = `Client ${i} of ${stylist.name}`;

        clients.push({
            id: clientId,
            name: clientName,
            email: `client${i}@example.com`,
            salonId: stylist.salonId,
            stylistId: stylist.id,
            address: "123 Main St",
            phone: "+123456789",
            joinDate: getDateAgo(100)
        });

        // 2 to 3 transactions per client session
        if (i <= 3) {
            const productsInSalon = baseProducts.filter(p => p.salonId === stylist.salonId);
            const product = productsInSalon[getRandom(0, productsInSalon.length - 1)];
            const quantity = getRandom(1, 2);
            const total = product.price * quantity;

            // Track Totals for consistency
            stylistTotals[stylist.id].sales += total;
            stylistTotals[stylist.id].units += quantity;
            productTotals[product.id].revenue += total;
            productTotals[product.id].units += quantity;

            // Sales record
            sales.push({
                id: `sale-${stylist.id}-${i}`,
                stylistId: stylist.id,
                stylistName: stylist.name,
                clientId: clientId,
                clientName: clientName,
                products: [{
                    productId: product.id,
                    productName: product.name,
                    price: product.price,
                    imageUrl: product.imageUrl,
                    quantity: quantity
                }],
                totalAmount: total,
                total: total,
                date: getDateAgo(i),
                salonId: stylist.salonId,
                status: "Completed"
            });

            // Rec record
            recs.push({
                id: `rec-${stylist.id}-${i}`,
                stylistId: stylist.id,
                stylistName: stylist.name,
                clientId: clientId,
                clientName: clientName,
                hairAnalysis: { type: "Normal", condition: "Healthy", metrics: [{ label: "Hydration", value: 80 }] },
                suggestedProducts: [{ productId: product.id, productName: product.name, score: 0.95, sold: true }],
                salonId: stylist.salonId,
                createdAt: getDateAgo(i)
            });
        }
    }
});

// Final Export Data with matched totals
export const mockClients = clients;
export const mockAIRecommendations = recs;
export const mockSales = sales;

export const mockStylists = baseStylists.map(s => ({
    ...s,
    totalSales: stylistTotals[s.id].sales,
    unitsSold: stylistTotals[s.id].units,
    clientsCount: clients.filter(c => c.stylistId === s.id).length,
    scansCount: recs.filter(r => r.stylistId === s.id).length
}));

export const mockProducts = baseProducts.map(p => ({
    ...p,
    totalRevenue: productTotals[p.id].revenue,
    unitsSold: productTotals[p.id].units,
    inventory: p.inventory - productTotals[p.id].units // Deduct sold units from inventory
}));

// 9. Separate App Configs per Salon
export const mockConfigs = {
    // Salon 1: Classic Elegance Config
    "salon-1": {
        hairTypes: ['Straight', 'Wavy', 'Curly', 'Coily'],
        hairConditions: ['Dry', 'Oily', 'Normal', 'Dandruff', 'Colored', 'Thinning'],
        hairColors: [
            { id: 'black', name: 'Raven Black', imageUrl: 'https://images.unsplash.com/photo-1543946602-a0fce8117697?w=150' },
            { id: 'brown', name: 'Chestnut Brown', imageUrl: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=150' }
        ],
        scanMetrics: ['Hydration', 'Strength', 'Scalp Health'],
        questionnaire: [
            { id: 'age', question: 'What is your age range?', options: ['Under 18', '18-25', '26-40', '40+'], type: 'dropdown' },
            { id: 'goal', question: 'Primary hair goal?', options: ['Growth', 'Shine', 'Health', 'Volume'], type: 'dropdown' }
        ],
        homeBanner: {
            imageUrl: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800',
            title: 'Welcome to Elegance',
            subtitle: 'Lahore Luxury Branch',
            showStats: true
        },
        supportEmail: 'elegance@support.com',
        supportPhone: '+92 300 0000000',
        termsAndConditions: 'Terms for Elegance Salon...',
        privacyPolicy: 'Privacy for Elegance Salon...',
        homeCategories: [
            { id: 'ai', label: 'Consultation', icon: 'Bot' },
            { id: 'scans', label: 'Analysis', icon: 'Scan' },
            { id: 'products', label: 'Boutique', icon: 'Package' }
        ]
    },
    // Salon 2: Modern Urban Studio Config
    "salon-2": {
        hairTypes: ['Short/Buzz', 'Medium/Textured', 'Long/Flowing'],
        hairConditions: ['Bleached', 'Sun Damaged', 'City Pollution', 'Healthy'],
        hairColors: [
            { id: 'neon', name: 'Electric Blue', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
            { id: 'platinum', name: 'Icy Platinum', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150' }
        ],
        scanMetrics: ['Texture', 'Scalp Cleanliness', 'UV Damage'],
        questionnaire: [
            { id: 'lifestyle', question: 'How often do you style your hair?', options: ['Daily', 'Rarely', 'Weekends'], type: 'dropdown' },
            { id: 'vibe', question: 'Choose your urban vibe:', options: ['Classic', 'Edgy', 'Minimalist'], type: 'dropdown' }
        ],
        homeBanner: {
            imageUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800',
            title: 'Urban Style Hub',
            subtitle: 'Downtown Metro Station',
            showStats: false
        },
        supportEmail: 'urban@studio.com',
        supportPhone: '+1 987 654 4444',
        termsAndConditions: 'Urban Studio Rules...',
        privacyPolicy: 'Urban Studio Privacy...',
        homeCategories: [
            { id: 'ai', label: 'AI Stylist', icon: 'Bot' },
            { id: 'scans', label: 'Fast Scan', icon: 'Scan' },
            { id: 'products', label: 'Shop Urban', icon: 'Package' }
        ]
    }
};

// Fallback for any other salons
export const mockConfig = mockConfigs["salon-1"];
