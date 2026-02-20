// Mock data for Phase 1 - Static UI

// Mock data for Phase 1 - Static UI

export const mockSuperAdmin = {
    id: "super-admin-1",
    email: "admin@gmail.com",
    password: "12345678",
    name: "Super Admin",
    role: "super",
};

export const mockSalonManagers = [
    {
        id: "manager-1",
        email: "salon@manager.com",
        password: "12345678",
        name: "Hassan Ameer",
        phone: "+0123456789",
        bio: "Expert salon manager with 10 years experience",
        skills: "Management, Styling, Customer Service",
        status: "Active",
        salonId: "salon-1",
        role: "manager",
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
    },
    {
        id: "manager-2",
        email: "alex@manager.com",
        password: "12345678",
        name: "Alex Rivera",
        phone: "+1987654321",
        bio: "Operations specialist focused on premium client experiences.",
        status: "Active",
        salonId: "salon-1",
        role: "manager",
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
    },
    {
        id: "manager-3",
        email: "sophia@manager.com",
        password: "12345678",
        name: "Sophia Chen",
        phone: "+1122334455",
        bio: "Creative director with a focus on sustainable beauty practices.",
        status: "Active",
        salonId: "salon-1",
        role: "manager",
        imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
    }
];

export const mockSalon = {
    id: "salon-1",
    name: "Elegance Hair Salon",
    address: "123 Beauty Street, Style City",
    phone: "+0123456789",
    managerId: "manager-1"
};

export const mockStylists = [
    {
        id: "stylist-1",
        name: "Emma Johnson",
        email: "emma@salon.com",
        phone: "+1 234 567 8901",
        password: "12345678",
        status: "Active",
        totalSales: 24450.00,
        unitsSold: 356,
        salonId: "salon-1",
        bio: "Master colorist and stylist with a passion for creative hair design.",
        skills: "Balayage, Color Correction, Precision Cutting",
        imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
        clientsCount: 156,
        scansCount: 432
    },
    {
        id: "stylist-2",
        name: "Michael Chen",
        email: "michael@salon.com",
        phone: "+1 234 567 8902",
        password: "12345678",
        status: "Active",
        totalSales: 21230.50,
        unitsSold: 284,
        salonId: "salon-1",
        bio: "Specialist in men's grooming and modern textures.",
        skills: "Fade Techniques, Beard Grooming, Textured Cuts",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
        clientsCount: 124,
        scansCount: 312
    },
    {
        id: "stylist-3",
        name: "Sarah Williams",
        email: "sarah@salon.com",
        phone: "+1 234 567 8903",
        password: "12345678",
        status: "Active",
        totalSales: 18500.00,
        unitsSold: 210,
        salonId: "salon-1",
        bio: "Organic treatment specialist and bridal stylist.",
        skills: "Bridal Updos, Organic Treatments, Hair Botox",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
        clientsCount: 98,
        scansCount: 245
    },
    {
        id: "stylist-4",
        name: "David Martinez",
        email: "david@salon.com",
        phone: "+1 234 567 8904",
        password: "12345678",
        status: "Active",
        totalSales: 15400.00,
        unitsSold: 185,
        salonId: "salon-1",
        bio: "Precision cutting and urban style expert.",
        skills: "Undercuts, Geometric Styles, Texture Enhancement",
        imageUrl: "https://images.unsplash.com/photo-1492562080023-ab3dbdf5bb3d?w=150&h=150&fit=crop",
        clientsCount: 85,
        scansCount: 195
    }
];

export const mockProducts = [
    {
        id: "prod-1",
        name: "Hydrating Shampoo",
        brand: "Salon Pro",
        category: "Shampoo",
        price: 24.99,
        sku: "SP-SH-001",
        description: "Professional hydrating shampoo for dry hair",
        inventory: 45,
        unitsSold: 124,
        totalRevenue: 3098.76,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1585232351009-aa87416fca90?w=300",
        tags: ["dry hair", "hydrating", "sulfate-free"],
        aiEnabled: true,
        preSelected: true,
        salonId: "salon-1",
    },
    {
        id: "prod-2",
        name: "Volume Conditioner",
        brand: "Luxe Hair",
        category: "Conditioner",
        price: 28.50,
        sku: "LH-CD-002",
        description: "Volumizing conditioner for fine hair",
        inventory: 32,
        unitsSold: 89,
        totalRevenue: 2536.50,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1552046122-03184de85e08?w=300",
        tags: ["fine hair", "volume", "lightweight"],
        aiEnabled: true,
        preSelected: false,
        salonId: "salon-1",
    },
    {
        id: "prod-3",
        name: "Repair Hair Mask",
        brand: "Salon Pro",
        category: "Treatment",
        price: 45.00,
        sku: "SP-TM-003",
        description: "Deep repair treatment for damaged hair",
        inventory: 28,
        unitsSold: 56,
        totalRevenue: 2520.00,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=300",
        tags: ["damaged hair", "repair", "intensive"],
        aiEnabled: true,
        preSelected: true,
        salonId: "salon-1",
    },
    {
        id: "prod-4",
        name: "Smoothing Serum",
        brand: "Silk Touch",
        category: "Styling",
        price: 32.99,
        sku: "ST-SR-004",
        description: "Anti-frizz smoothing serum",
        inventory: 56,
        unitsSold: 142,
        totalRevenue: 4684.58,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=300",
        tags: ["frizzy hair", "smoothing", "shine"],
        aiEnabled: true,
        preSelected: false,
        salonId: "salon-1",
    },
    {
        id: "prod-5",
        name: "Color Protection Spray",
        brand: "Luxe Hair",
        category: "Styling",
        price: 19.99,
        sku: "LH-SP-005",
        description: "UV protection spray for colored hair",
        inventory: 15,
        unitsSold: 34,
        totalRevenue: 679.66,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1626784215021-2e39ccf971cd?w=300",
        tags: ["colored hair", "protection", "UV"],
        aiEnabled: true,
        preSelected: false,
        salonId: "salon-1",
    },
    {
        id: "prod-6",
        name: "Curl Defining Cream",
        brand: "Curl Magic",
        category: "Styling",
        price: 26.50,
        sku: "CM-CR-006",
        description: "Defines and enhances natural curls",
        inventory: 41,
        unitsSold: 76,
        totalRevenue: 2014.00,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1591130901618-3f31f2dc703b?w=300",
        tags: ["curly hair", "definition", "hold"],
        aiEnabled: true,
        preSelected: true,
        salonId: "salon-1",
    },
    {
        id: "prod-7",
        name: "Scalp Revitalizer",
        brand: "Nature Care",
        category: "Treatment",
        price: 38.00,
        sku: "NC-TR-007",
        description: "Cooling treatment for scalp health",
        inventory: 22,
        unitsSold: 45,
        totalRevenue: 1710.00,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=300",
        tags: ["scalp care", "cooling", "herbal"],
        aiEnabled: true,
        preSelected: false,
        salonId: "salon-1",
    },
    {
        id: "prod-8",
        name: "Matte Hair Wax",
        brand: "Styling Essentials",
        category: "Styling",
        price: 22.00,
        sku: "SE-WX-008",
        description: "Strong hold with matte finish",
        inventory: 65,
        unitsSold: 198,
        totalRevenue: 4356.00,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1554462411-c488950882e3?w=300",
        tags: ["men", "strong hold", "matte"],
        aiEnabled: true,
        preSelected: false,
        salonId: "salon-1",
    },
    {
        id: "prod-9",
        name: "Silver Bright Shampoo",
        brand: "Color Life",
        category: "Shampoo",
        price: 29.99,
        sku: "CL-SH-009",
        description: "Removes yellow tones from blonde/silver hair",
        inventory: 18,
        unitsSold: 28,
        totalRevenue: 839.72,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=300",
        tags: ["blonde", "silver", "brightening"],
        aiEnabled: true,
        preSelected: false,
        salonId: "salon-1",
    },
    {
        id: "prod-10",
        name: "Argan Oil Elixir",
        brand: "Pure Gold",
        category: "Treatment",
        price: 34.00,
        sku: "PG-OL-010",
        description: "Premium argan oil for silky smooth hair",
        inventory: 30,
        unitsSold: 112,
        totalRevenue: 3808.00,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1552046122-03184de85e08?w=300",
        tags: ["argan oil", "shine", "nourishing"],
        aiEnabled: true,
        preSelected: true,
        salonId: "salon-1",
    },
    {
        id: "prod-11",
        name: "Detoxifying Charcoal Mask",
        brand: "Pure Care",
        category: "Treatment",
        price: 42.00,
        sku: "PC-CM-011",
        description: "Deep cleansing charcoal mask for oily scalp",
        inventory: 25,
        unitsSold: 45,
        totalRevenue: 1890.00,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=300",
        tags: ["oily hair", "detox", "charcoal"],
        aiEnabled: true,
        preSelected: false,
        salonId: "salon-1",
    },
    {
        id: "prod-12",
        name: "Biotin Growth Serum",
        brand: "Vital Hair",
        category: "Treatment",
        price: 55.00,
        sku: "VH-GS-012",
        description: "Advanced growth serum with biotin and caffeine",
        inventory: 20,
        unitsSold: 32,
        totalRevenue: 1760.00,
        active: true,
        imageUrl: "https://images.unsplash.com/photo-1610915769747-0348705fced4?w=300",
        tags: ["thinning hair", "growth", "biotin"],
        aiEnabled: true,
        preSelected: true,
        salonId: "salon-1",
    }
];

// Helper to generate dates in the last 30 days
const getDateAgo = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
};

export const mockSales = [
    // Today
    {
        id: "sale-1",
        date: getDateAgo(0),
        stylistId: "stylist-1",
        stylistName: "Emma Johnson",
        sessionId: "session-101",
        products: [
            { productId: "prod-1", productName: "Hydrating Shampoo", quantity: 2, price: 24.99 },
            { productId: "prod-3", productName: "Repair Hair Mask", quantity: 1, price: 45.00 },
        ],
        total: 94.98,
        totalAmount: 94.98,
        salonId: "salon-1",
        clientName: "Jane Doe"
    },
    {
        id: "sale-2",
        date: getDateAgo(0),
        stylistId: "stylist-2",
        stylistName: "Michael Chen",
        sessionId: "session-102",
        products: [
            { productId: "prod-2", productName: "Volume Conditioner", quantity: 1, price: 28.50 },
            { productId: "prod-4", productName: "Smoothing Serum", quantity: 1, price: 32.99 },
        ],
        total: 61.49,
        totalAmount: 61.49,
        salonId: "salon-1",
        clientName: "John Smith"
    },
    {
        id: "sale-3",
        date: getDateAgo(0),
        stylistId: "stylist-4",
        stylistName: "David Martinez",
        sessionId: "session-103",
        products: [
            { productId: "prod-8", productName: "Matte Hair Wax", quantity: 1, price: 22.00 },
        ],
        total: 22.00,
        totalAmount: 22.00,
        salonId: "salon-1",
        clientName: "Mark Wilson"
    },
    // Yesterday
    {
        id: "sale-4",
        date: getDateAgo(1),
        stylistId: "stylist-3",
        stylistName: "Sarah Williams",
        sessionId: "session-104",
        products: [
            { productId: "prod-1", productName: "Hydrating Shampoo", quantity: 1, price: 24.99 },
            { productId: "prod-2", productName: "Volume Conditioner", quantity: 1, price: 28.50 },
            { productId: "prod-4", productName: "Smoothing Serum", quantity: 2, price: 32.99 },
        ],
        total: 119.47,
        totalAmount: 119.47,
        salonId: "salon-1",
        clientName: "Emily Brown"
    },
    {
        id: "sale-5",
        date: getDateAgo(1),
        stylistId: "stylist-5",
        stylistName: "Lisa Anderson",
        sessionId: "session-105",
        products: [
            { productId: "prod-3", productName: "Repair Hair Mask", quantity: 2, price: 45.00 },
            { productId: "prod-10", productName: "Argan Oil Elixir", quantity: 1, price: 34.00 },
        ],
        total: 124.00,
        totalAmount: 124.00,
        salonId: "salon-1",
        clientName: "Anna White"
    },
    // Past Week
    {
        id: "sale-6",
        date: getDateAgo(3),
        stylistId: "stylist-1",
        stylistName: "Emma Johnson",
        sessionId: "session-106",
        products: [
            { productId: "prod-6", productName: "Curl Defining Cream", quantity: 1, price: 26.50 },
            { productId: "prod-7", productName: "Scalp Revitalizer", quantity: 1, price: 38.00 },
        ],
        total: 64.50,
        totalAmount: 64.50,
        salonId: "salon-1",
        clientName: "Jane Doe"
    },
    {
        id: "sale-7",
        date: getDateAgo(4),
        stylistId: "stylist-6",
        stylistName: "James Wilson",
        sessionId: "session-107",
        products: [
            { productId: "prod-1", productName: "Hydrating Shampoo", quantity: 3, price: 24.99 },
        ],
        total: 74.97,
        totalAmount: 74.97,
        salonId: "salon-1",
        clientName: "John Smith"
    },
    {
        id: "sale-8",
        date: getDateAgo(5),
        stylistId: "stylist-2",
        stylistName: "Michael Chen",
        sessionId: "session-108",
        products: [
            { productId: "prod-9", productName: "Silver Bright Shampoo", quantity: 1, price: 29.99 },
            { productId: "prod-10", productName: "Argan Oil Elixir", quantity: 1, price: 34.00 },
        ],
        total: 63.99,
        totalAmount: 63.99,
        salonId: "salon-1",
        clientName: "Emily Brown"
    },
    {
        id: "sale-9",
        date: getDateAgo(6),
        stylistId: "stylist-8",
        stylistName: "Robert Brown",
        sessionId: "session-109",
        products: [
            { productId: "prod-4", productName: "Smoothing Serum", quantity: 1, price: 32.99 },
            { productId: "prod-7", productName: "Scalp Revitalizer", quantity: 1, price: 38.00 },
        ],
        totalAmount: 70.99,
        salonId: "salon-1",
        clientName: "Anna White"
    },
    {
        id: "sale-10",
        date: getDateAgo(0),
        stylistId: "stylist-3",
        stylistName: "Sarah Williams",
        sessionId: "session-110",
        products: [
            { productId: "prod-11", productName: "Detoxifying Charcoal Mask", quantity: 2, price: 42.00 },
            { productId: "prod-1", productName: "Hydrating Shampoo", quantity: 2, price: 24.99 },
        ],
        total: 133.98,
        totalAmount: 133.98,
        salonId: "salon-1",
        clientName: "Jessica Lee"
    },
    {
        id: "sale-11",
        date: getDateAgo(0),
        stylistId: "stylist-4",
        stylistName: "David Martinez",
        sessionId: "session-111",
        products: [
            { productId: "prod-12", productName: "Biotin Growth Serum", quantity: 2, price: 55.00 },
            { productId: "prod-2", productName: "Volume Conditioner", quantity: 2, price: 28.50 },
        ],
        total: 167.00,
        totalAmount: 167.00,
        salonId: "salon-1",
        clientName: "Michael Rogers"
    }
];


export const mockAIRecommendations = [
    {
        id: "rec-1",
        sessionId: "session-101",
        date: getDateAgo(0),
        stylistId: "stylist-1",
        stylistName: "Emma Johnson",
        clientId: "client-201",
        clientName: "Jane Doe",
        hairAnalysis: {
            type: "Dry, damaged",
            condition: "Needs hydration and repair",
            metrics: [
                { label: 'Hydration', value: 85 },
                { label: 'Strength', value: 65 },
                { label: 'Scalp Health', value: 92 }
            ],
            images: {
                before: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400",
                after: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400"
            }
        },
        suggestedProducts: [
            { productId: "prod-1", productName: "Hydrating Shampoo", score: 0.95, sold: true },
            { productId: "prod-3", productName: "Repair Hair Mask", score: 0.92, sold: true },
            { productId: "prod-4", productName: "Smoothing Serum", score: 0.78, sold: false },
        ],
        salonId: "salon-1",
    },
    {
        id: "rec-2",
        sessionId: "session-102",
        date: getDateAgo(0),
        stylistId: "stylist-2",
        stylistName: "Michael Chen",
        clientId: "client-202",
        clientName: "John Smith",
        hairAnalysis: {
            type: "Fine, limp",
            condition: "Needs volume",
            metrics: [
                { label: 'Hydration', value: 70 },
                { label: 'Strength', value: 45 },
                { label: 'Scalp Health', value: 88 }
            ],
            images: {
                before: "https://images.unsplash.com/photo-1551351141-86a1179e8cbb?w=400",
                after: "https://images.unsplash.com/photo-1595475207225-428b62bda831?w=400"
            }
        },
        suggestedProducts: [
            { productId: "prod-2", productName: "Volume Conditioner", score: 0.94, sold: true },
            { productId: "prod-4", productName: "Smoothing Serum", score: 0.85, sold: true },
        ],
        salonId: "salon-1",
    },
    {
        id: "rec-3",
        sessionId: "session-103",
        date: getDateAgo(0),
        stylistId: "stylist-4",
        stylistName: "David Martinez",
        clientId: "client-301",
        clientName: "Mark Wilson",
        hairAnalysis: {
            type: "Normal, Short",
            condition: "Desires matte styling",
        },
        suggestedProducts: [
            { productId: "prod-8", productName: "Matte Hair Wax", score: 0.98, sold: true },
            { productId: "prod-7", productName: "Scalp Revitalizer", score: 0.82, sold: false },
        ],
        salonId: "salon-1",
    },
    {
        id: "rec-4",
        sessionId: "session-104",
        date: getDateAgo(1),
        stylistId: "stylist-3",
        stylistName: "Sarah Williams",
        clientId: "client-204",
        clientName: "Emily Brown",
        hairAnalysis: {
            type: "Normal, slightly dry",
            condition: "Maintenance needed",
        },
        suggestedProducts: [
            { productId: "prod-1", productName: "Hydrating Shampoo", score: 0.91, sold: true },
            { productId: "prod-2", productName: "Volume Conditioner", score: 0.89, sold: true },
            { productId: "prod-4", productName: "Smoothing Serum", score: 0.87, sold: true },
        ],
        salonId: "salon-1",
    },
    {
        id: "rec-5",
        sessionId: "session-105",
        date: getDateAgo(1),
        stylistId: "stylist-5",
        stylistName: "Lisa Anderson",
        clientId: "client-205",
        clientName: "Anna White",
        hairAnalysis: {
            type: "Damaged, Dull",
            condition: "Requires intensive repair and shine",
        },
        suggestedProducts: [
            { productId: "prod-3", productName: "Repair Hair Mask", score: 0.96, sold: true },
            { productId: "prod-10", productName: "Argan Oil Elixir", score: 0.94, sold: true },
        ],
        salonId: "salon-1",
    },
    {
        id: "rec-6",
        sessionId: "session-110",
        date: getDateAgo(0),
        stylistId: "stylist-3",
        stylistName: "Sarah Williams",
        clientId: "client-206",
        clientName: "Jessica Lee",
        hairAnalysis: {
            type: "Oily scalp, Dry ends",
            condition: "Requires deep scalp detox and tip hydration",
            metrics: [
                { label: 'Hydration', value: 45 },
                { label: 'Strength', value: 78 },
                { label: 'Scalp Health', value: 30 }
            ]
        },
        suggestedProducts: [
            { productId: "prod-11", productName: "Detoxifying Charcoal Mask", score: 0.98, sold: true },
            { productId: "prod-1", productName: "Hydrating Shampoo", score: 0.92, sold: true },
        ],
        salonId: "salon-1",
    },
    {
        id: "rec-7",
        sessionId: "session-111",
        date: getDateAgo(0),
        stylistId: "stylist-4",
        stylistName: "David Martinez",
        clientId: "client-207",
        clientName: "Michael Rogers",
        hairAnalysis: {
            type: "Thinning, Lacks vitality",
            condition: "Growth stimulation and volume focus",
            metrics: [
                { label: 'Hydration', value: 60 },
                { label: 'Strength', value: 40 },
                { label: 'Scalp Health', value: 55 }
            ]
        },
        suggestedProducts: [
            { productId: "prod-12", productName: "Biotin Growth Serum", score: 0.97, sold: true },
            { productId: "prod-2", productName: "Volume Conditioner", score: 0.90, sold: true },
        ],
        salonId: "salon-1",
    }
];

export const mockDashboardStats = {
    today: {
        totalSales: 345.20,
        totalScans: 12,
        productsSold: 15,
        conversionRate: 85,
    },
    week: {
        totalSales: 2450.75,
        totalScans: 84,
        productsSold: 112,
        conversionRate: 78,
    },
    month: {
        totalSales: 12840.00,
        totalScans: 342,
        productsSold: 456,
        conversionRate: 72,
    },
    topStylists: [
        { id: "stylist-1", name: "Emma Johnson", sales: 12450.00 },
        { id: "stylist-2", name: "Michael Chen", sales: 10230.50 },
        { id: "stylist-3", name: "Sarah Williams", sales: 9875.25 },
        { id: "stylist-5", name: "Lisa Anderson", sales: 8650.75 },
        { id: "stylist-4", name: "David Martinez", sales: 5420.00 },
    ],
    topProducts: [
        { id: "prod-1", name: "Hydrating Shampoo", unitsSold: 145, revenue: 3623.55 },
        { id: "prod-3", name: "Repair Hair Mask", unitsSold: 98, revenue: 4410.00 },
        { id: "prod-2", name: "Volume Conditioner", unitsSold: 87, revenue: 2479.50 },
        { id: "prod-4", name: "Smoothing Serum", unitsSold: 76, revenue: 2507.24 },
        { id: "prod-10", name: "Argan Oil Elixir", unitsSold: 64, revenue: 2176.00 },
    ],
};

export const mockConfig = {
    hairTypes: ['Straight', 'Wavy', 'Curly', 'Coily'],
    hairConditions: ['Dry', 'Oily', 'Normal', 'Dandruff', 'Colored', 'Thinning'],
    hairColors: [
        { id: 'black', name: 'Black', imageUrl: 'https://images.unsplash.com/photo-1543946602-a0fce8117697?w=150' },
        { id: 'brown', name: 'Brown', imageUrl: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=150' },
        { id: 'blonde', name: 'Blonde', imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150' },
        { id: 'red', name: 'Red', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' }
    ],
    scanMetrics: ['Hydration', 'Strength', 'Scalp Health'],
    questionnaire: [
        { id: 'age', question: 'Age group?', options: ['Under 18', '18-25', '26-35', '36-50', '50+'], type: 'dropdown' },
        { id: 'gender', question: 'Gender?', options: ['Female', 'Male', 'Non-binary', 'Prefer not to say'], type: 'dropdown' },
        { id: 'service', question: 'Service you prefer', options: ['Haircut', 'Coloring', 'Treatment', 'Styling'], type: 'dropdown' },
        { id: 'type', question: 'Hair type', options: ['Straight', 'Wavy', 'Curly', 'Coily'], type: 'dropdown' },
        { id: 'natural_color', question: 'Natural hair color', options: ['Black', 'Brown', 'Blonde', 'Red', 'Grey'], type: 'dropdown' },
        { id: 'chemically_treated', question: 'Chemically treated?', options: ['Yes, coloring', 'Yes, perming', 'Yes, straightening', 'No'], type: 'dropdown' },
        { id: 'health', question: "Hair's current health?", options: ['Very Healthy', 'Healthy', 'Minor Damage', 'Severely Damaged'], type: 'dropdown' },
        { id: 'face_issues', question: 'Face issues', options: ['Acne', 'Dryness', 'Oily skin', 'None'], type: 'dropdown' },
        { id: 'scalp_feel', question: 'How oily or dry does your scalp feel?', options: ['Very Oily', 'Oily', 'Normal', 'Dry', 'Very Dry'], type: 'dropdown' },
        { id: 'allergies', question: 'Allergies or sensitivities to hair products', options: ['Fragrance', 'Parabens', 'Sulfates', 'None'], type: 'multiselect' },
        { id: 'preferences', question: 'Prefer natural or chemical-based products', options: ['100% Natural', 'Mainly Natural', 'No Preference', 'Professional Chemical'], type: 'dropdown' },
        { id: 'brand', question: 'Use any specific brand?', options: ['Loreal', 'Matrix', 'Wella', 'Schwarzkopf', 'None'], type: 'dropdown' }
    ],
    homeBanner: {
        imageUrl: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800',
        title: 'Appointment',
        subtitle: 'Lahore, Pakistan',
        showStats: true
    },
    salonInfo: {
        name: 'Elegance Hair Salon',
        location: 'Lahore, Pakistan',
        phone: '+92 300 1234567',
        owner: 'Hassan Ameer',
        logoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=150'
    },
    homeCategories: [
        { id: 'ai', label: 'A.I', icon: 'Sparkles' },
        { id: 'scans', label: 'Hair Scans', icon: 'Scan' },
        { id: 'products', label: 'Products', icon: 'Package' }
    ],
    supportEmail: 'support@salon-app.com',
    supportPhone: '+1 (555) 123-4567',
    termsAndConditions: 'Please read our terms and conditions...',
    privacyPolicy: 'Your privacy is important to us...',
    aiModelSettings: {
        sensitivity: 0.75,
        autoRecommend: true
    }
};

export const mockClients = [
    {
        id: "client-201",
        name: "Jane Doe",
        email: "jane.doe@example.com",
        phone: "+1 (555) 001-2233",
        address: "456 Oak Ave, Style City",
        joinDate: getDateAgo(120),
        lastVisit: getDateAgo(5),
        totalVisits: 8,
        hairAnalysis: {
            type: "Dry, damaged",
            condition: "Needs hydration"
        },
        salonId: "salon-1"
    },
    {
        id: "client-202",
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1 (555) 001-4455",
        address: "789 Pine Rd, Style City",
        joinDate: getDateAgo(90),
        lastVisit: getDateAgo(10),
        totalVisits: 5,
        hairAnalysis: {
            type: "Fine, limp",
            condition: "Lacks volume"
        },
        salonId: "salon-1"
    },
    {
        id: "client-204",
        name: "Emily Brown",
        email: "emily.b@example.com",
        phone: "+1 (555) 001-6677",
        address: "321 Maple Dr, Style City",
        joinDate: getDateAgo(60),
        lastVisit: getDateAgo(2),
        totalVisits: 3,
        hairAnalysis: {
            type: "Normal",
            condition: "Healthy"
        },
        salonId: "salon-1"
    },
    {
        id: "client-205",
        name: "Anna White",
        email: "anna.w@example.com",
        phone: "+1 (555) 001-8899",
        address: "159 Cedar Blvd, Style City",
        joinDate: getDateAgo(30),
        lastVisit: getDateAgo(1),
        totalVisits: 2,
        hairAnalysis: {
            type: "Curly",
            condition: "Frizzy"
        },
        salonId: "salon-1"
    },
    {
        id: "client-206",
        name: "Jessica Lee",
        email: "jessica.lee@example.com",
        phone: "+1 (555) 002-1122",
        address: "123 Cherry Ln, Style City",
        joinDate: getDateAgo(15),
        lastVisit: getDateAgo(0),
        totalVisits: 1,
        hairAnalysis: {
            type: "Mixed (Oily/Dry)",
            condition: "Scalp issues"
        },
        salonId: "salon-1"
    },
    {
        id: "client-207",
        name: "Michael Rogers",
        email: "m.rogers@example.com",
        phone: "+1 (555) 002-3344",
        address: "456 Birch Dr, Style City",
        joinDate: getDateAgo(10),
        lastVisit: getDateAgo(0),
        totalVisits: 1,
        hairAnalysis: {
            type: "Thinning",
            condition: "Needs growth"
        },
        salonId: "salon-1"
    }
];
