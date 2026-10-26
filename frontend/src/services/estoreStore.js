/**
 * E-Store (Pooja Samagri) Core Engine & State Store (User App)
 * Products, multi-angle images, wishlist, cart & order tracking.
 * Synchronized dynamically with live backend API & offline fallbacks.
 */

export const STORE_CATEGORIES = [
  { id: 'all', name: 'All Categories', nameHi: 'सभी श्रेणियां', icon: 'apps' },
  {
    id: 'kits',
    name: 'Pooja Kits',
    nameHi: 'पूजा किट्स',
    icon: '📦',
    image: 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'diya',
    name: 'Diya & Deepak',
    nameHi: 'दीपक व आरती',
    icon: '🪔',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'havan',
    name: 'Havan Samagri',
    nameHi: 'हवन सामग्री',
    icon: '🔥',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'dhoop',
    name: 'Dhoop & Agarbatti',
    nameHi: 'धूप व अगरबत्ती',
    icon: '🌸',
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'murti',
    name: 'Murtis & Idols',
    nameHi: 'मूर्तियां एवं विग्रह',
    icon: '🕉️',
    image: 'https://images.unsplash.com/photo-1567591414240-e2652b7e1781?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'bartan',
    name: 'Brass Utensils',
    nameHi: 'पीतल के बर्तन',
    icon: '🥣',
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'mala',
    name: 'Rudraksha & Mala',
    nameHi: 'रुद्राक्ष एवं माला',
    icon: '📿',
    image: 'https://images.unsplash.com/photo-1620619767323-b95a89183081?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'vastra',
    name: 'Vastra & Aasan',
    nameHi: 'वस्त्र एवं आसन',
    icon: '👘',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'pavitra',
    name: 'Gangajal & Dravya',
    nameHi: 'कलश एवं गंगाजल',
    icon: '💧',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'yantra',
    name: 'Yantra & Jyotish',
    nameHi: 'यंत्र एवं वास्तु',
    icon: '⭐',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'books',
    name: 'Vedic Books',
    nameHi: 'धार्मिक पुस्तकें',
    icon: '📖',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
  },
  {
    id: 'prasad',
    name: 'Prasad & Bhog',
    nameHi: 'प्रसाद एवं भोग',
    icon: '🍯',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80',
  },
];

export const PROMO_BANNERS = [
  {
    id: 'b1',
    title: 'Sacred Products for a Better Life',
    subtitle: 'Authentic • Traditional • Trusted',
    code: 'VAIDIC10',
    discount: 'Flat 10% OFF',
    tag: 'FESTIVAL SPECIAL',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'b2',
    title: 'Pure Brass Pooja Thali Sets',
    subtitle: 'Handcrafted by Master Artisans in Varanasi',
    code: 'SHUBH50',
    discount: 'Save up to 40%',
    tag: 'BESTSELLER',
    image: 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'b3',
    title: 'Certified 5-Mukhi Rudraksha',
    subtitle: 'Consecrated at Haridwar Ganga Ghat',
    code: 'PRASAD100',
    discount: 'Lab Certified Pure',
    tag: 'SACRED BLESSING',
    image: 'https://images.unsplash.com/photo-1620619767323-b95a89183081?w=800&auto=format&fit=crop&q=80',
  },
];

export const DEMO_STORE_PRODUCTS = [
  {
    id: 'PRD-1',
    name: 'Pooja Thali Set (Brass)',
    nameHi: 'शुद्ध पीतल पूजा थाली सेट (सम्पूर्ण सामग्री)',
    price: 599,
    mrp: 899,
    discountPct: 33,
    category: 'kits',
    subCategory: 'thali',
    categoryName: 'Pooja Kits',
    stock: 45,
    rating: 4.9,
    reviewsCount: 156,
    isBestseller: true,
    isFeatured: true,
    description: 'Beautifully crafted brass pooja thali set with diya, incense holder, roli, chawal katori and bell. Perfect for daily pooja, festive celebrations and housewarming ceremonies.',
    features: ['100% Solid Brass', 'Handcrafted Traditional Design', 'Long Lasting & Corrosion Resistant'],
    specifications: [
      { label: 'Material', value: 'Virgin Brass (Pital)' },
      { label: 'Thali Diameter', value: '8.5 Inches' },
      { label: 'Weight', value: '450 Grams' },
      { label: 'Included Accessories', value: 'Diya, Agarbatti Stand, Roli Chawal Bowls, Bell' },
      { label: 'Origin', value: 'Varanasi, Uttar Pradesh' },
    ],
    reviews: [
      { id: 'r1', user: 'Sunita G.', rating: 5, date: '18 Oct 2026', verified: true, text: 'Very heavy and pure brass. Beautiful finish on the thali. Arrived nicely packed!' },
      { id: 'r2', user: 'Ramesh K.', rating: 5, date: '12 Oct 2026', verified: true, text: 'Traditional carving is lovely. Complete set for daily mandir puja.' },
    ],
    image: 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=800&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1567591414240-e2652b7e1781?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v-thali-std', name: 'Standard (8.5 Inch)', price: 599, mrp: 899, stock: 45 },
      { id: 'v-thali-lrg', name: 'Grand (10.5 Inch)', price: 799, mrp: 1199, stock: 25 },
    ],
  },
  {
    id: 'PRD-2',
    name: 'Brass Diya (Deepak)',
    nameHi: 'शुद्ध पीतल पंचारती दीया',
    price: 249,
    mrp: 399,
    discountPct: 38,
    category: 'diya',
    subCategory: 'diya',
    categoryName: 'Diya & Deepak',
    stock: 60,
    rating: 4.8,
    reviewsCount: 124,
    isBestseller: true,
    isNewArrival: false,
    description: 'Traditional handcrafted heavy brass akhand diya with engraved floral base. Provides steady and auspicious flame for morning and evening aarti.',
    features: ['100% Solid Brass', 'Akhand Jyot Design', 'Heat Resistant Thick Rim'],
    specifications: [
      { label: 'Material', value: 'Pure Brass' },
      { label: 'Height', value: '4.2 Inches' },
      { label: 'Capacity', value: '50ml Oil / Ghee' },
      { label: 'Weight', value: '250 Grams' },
    ],
    reviews: [
      { id: 'r3', user: 'Mahesh T.', rating: 5, date: '15 Oct 2026', verified: true, text: 'Holds oil for hours without leaking. Perfect for Diwali and daily puja.' },
    ],
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1605371924599-2d0365da1ae0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1603555501671-8f96b3fce8e4?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v-diya-med', name: 'Medium (250g)', price: 249, mrp: 399, stock: 60 },
      { id: 'v-diya-lrg', name: 'Large (450g)', price: 449, mrp: 699, stock: 30 },
    ],
  },
  {
    id: 'PRD-3',
    name: 'Agarbatti (Premium Chandan)',
    nameHi: 'प्रीमियम प्राकृतिक चन्दन अगरबत्ती',
    price: 149,
    mrp: 220,
    discountPct: 32,
    category: 'dhoop',
    subCategory: 'incense',
    categoryName: 'Dhoop & Agarbatti',
    stock: 100,
    rating: 4.7,
    reviewsCount: 98,
    isBestseller: true,
    isFeatured: true,
    description: 'Natural charcoal-free temple grade incense sticks infused with pure Mysore Chandan, Kasturi, and sacred Himalayan herbs.',
    features: ['Charcoal Free & Non-Toxic', 'Authentic Temple Aroma', '45+ Minutes Long Burn Time'],
    specifications: [
      { label: 'Quantity', value: '100 Sticks' },
      { label: 'Fragrance', value: 'Pure Sandalwood (Chandan)' },
      { label: 'Smoke', value: 'Low Smoke / No Black Carbon' },
    ],
    reviews: [
      { id: 'r4', user: 'Ananya P.', rating: 5, date: '14 Oct 2026', verified: true, text: 'No chemical smell at all! Just pure natural chandan fragrance that stays for hours.' },
    ],
    image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v-dhoop-std', name: 'Pack of 100 Sticks', price: 149, mrp: 220, stock: 100 },
    ],
  },
  {
    id: 'PRD-4',
    name: 'Rudraksha Mala (108 Beads)',
    nameHi: 'पंचमुखी सिद्ध रुद्राक्ष माला',
    price: 499,
    mrp: 799,
    discountPct: 38,
    category: 'mala',
    subCategory: 'mala',
    categoryName: 'Rudraksha & Mala',
    stock: 50,
    rating: 4.9,
    reviewsCount: 180,
    isBestseller: false,
    isFeatured: true,
    isNewArrival: true,
    description: 'Certified natural 5-Mukhi Nepali Rudraksha Mala with 108+1 Guru bead. Consecrated with sacred Vedic mantras at Haridwar Ganga Ghat.',
    features: ['Authentic 5-Mukhi Nepali Beads', 'Lab Certificate of Authenticity', 'Knotting Between Each Bead'],
    specifications: [
      { label: 'Bead Size', value: '8mm' },
      { label: 'Count', value: '108 + 1 Guru Bead' },
      { label: 'Origin', value: 'Nepal Himalaya' },
    ],
    reviews: [
      { id: 'r5', user: 'Virendra S.', rating: 5, date: '10 Oct 2026', verified: true, text: 'Genuine beads with clear mukhis. Gives immense mental calm during Japa.' },
    ],
    image: 'https://images.unsplash.com/photo-1620619767323-b95a89183081?w=800&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1620619767323-b95a89183081?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1620619767323-b95a89183081?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v-mala-std', name: 'Standard (8mm beads)', price: 499, mrp: 799, stock: 50 },
    ],
  },
  {
    id: 'PRD-5',
    name: 'Hanuman Idol (Brass)',
    nameHi: 'पंचमुखी संकटमोचन हनुमान मूर्ति',
    price: 1299,
    mrp: 1899,
    discountPct: 32,
    category: 'murti',
    subCategory: 'murti',
    categoryName: 'Murtis & Idols',
    stock: 20,
    rating: 5.0,
    reviewsCount: 88,
    isBestseller: true,
    isFeatured: true,
    description: 'Hand-carved premium brass Panchamukhi Hanuman Idol with intricate details and antique golden finish. Ideal for home altar and spiritual protection.',
    features: ['Solid Heavy Brass Casting', 'Exquisite Devotional Facial Details', 'Antique Gold Polish'],
    specifications: [
      { label: 'Height', value: '6 Inches' },
      { label: 'Weight', value: '1.25 Kilograms' },
      { label: 'Deity', value: 'Panchamukhi Hanuman' },
    ],
    reviews: [
      { id: 'r6', user: 'Deepak V.', rating: 5, date: '08 Oct 2026', verified: true, text: 'The idol has a very divine and powerful aura. Truly remarkable craftsmanship.' },
    ],
    image: 'https://images.unsplash.com/photo-1567591414240-e2652b7e1781?w=800&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1567591414240-e2652b7e1781?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1567591414240-e2652b7e1781?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1609234656388-0ff363383899?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v-hanuman-std', name: '6 Inch (1.2 kg)', price: 1299, mrp: 1899, stock: 20 },
    ],
  },
  {
    id: 'PRD-6',
    name: 'Vastu Yantra (Gold Plated)',
    nameHi: 'सिद्ध सम्पूर्ण वास्तु दोष निवारण यंत्र',
    price: 899,
    mrp: 1499,
    discountPct: 40,
    category: 'yantra',
    subCategory: 'yantra',
    categoryName: 'Yantra & Jyotish',
    stock: 35,
    rating: 4.8,
    reviewsCount: 64,
    isBestseller: false,
    isNewArrival: true,
    description: '24K gold-plated geometric Vastu Dosha Nivarana Yantra encased in high-grade wooden frame with sacred Vedic beeja mantras.',
    features: ['24K Gold Plated Sacred Geometry', 'Vedic Consecration Done', 'Ready to Wall Mount'],
    specifications: [
      { label: 'Dimensions', value: '6 x 6 Inches' },
      { label: 'Plating', value: '24K Micron Gold Foil' },
      { label: 'Frame', value: 'Premium Teakwood Finish' },
    ],
    reviews: [
      { id: 'r7', user: 'Priyanka N.', rating: 5, date: '05 Oct 2026', verified: true, text: 'Placed it in the northeast corner of my home. Felt positive vibrations right away.' },
    ],
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v-yantra-std', name: 'Frame 6x6 Inch', price: 899, mrp: 1499, stock: 35 },
    ],
  },
  {
    id: 'PRD-7',
    name: 'Ganga Jal (Pack of 2)',
    nameHi: 'गंगोत्री उद्गम शुद्ध पवित्र गंगाजल',
    price: 199,
    mrp: 299,
    discountPct: 33,
    category: 'pavitra',
    subCategory: 'gangajal',
    categoryName: 'Gangajal & Dravya',
    stock: 120,
    rating: 4.9,
    reviewsCount: 210,
    isBestseller: true,
    description: 'Untouched pure Gangotri Ganga Jal collected directly from source, hygienically sealed in copper-treated leakproof bottles.',
    features: ['100% Pure Gangotri Source', 'Sterilized & Sealed', 'Sacred for All Abhishek'],
    specifications: [
      { label: 'Pack Size', value: '2 x 500ml Bottles' },
      { label: 'Source', value: 'Gangotri Dham, Himalayas' },
    ],
    reviews: [
      { id: 'r8', user: 'Kailash B.', rating: 5, date: '02 Oct 2026', verified: true, text: 'Completely crystal clear water. Used for Mahadev Abhishek.' },
    ],
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v-gangajal-pack2', name: '2 x 500ml Bottles', price: 199, mrp: 299, stock: 120 },
    ],
  },
  {
    id: 'PRD-8',
    name: 'Shrimad Bhagavad Gita & Granth',
    nameHi: 'श्रीमद्भगवद्गीता (सचित्र सरल हिन्दी अनुवाद)',
    price: 349,
    mrp: 499,
    discountPct: 30,
    category: 'books',
    subCategory: 'scriptures',
    categoryName: 'Vedic Books',
    stock: 75,
    rating: 5.0,
    reviewsCount: 340,
    isBestseller: true,
    isFeatured: true,
    description: 'Authentic hardcover Sanskrit shlokas with word-by-word meaning and lucid Hindi commentary. Premium archival paper and bookmark ribbon included.',
    features: ['Deluxe Hardcover Binding', 'Original Sanskrit with Hindi Translation', 'Full Color Paintings'],
    specifications: [
      { label: 'Pages', value: '640 Pages' },
      { label: 'Language', value: 'Sanskrit & Hindi' },
      { label: 'Binding', value: 'Hardbound with Gold Foil' },
    ],
    reviews: [
      { id: 'r9', user: 'Radha M.', rating: 5, date: '28 Sep 2026', verified: true, text: 'Simple to understand explanation of Gita shlokas. The illustrations are breathtaking.' },
    ],
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v-gita-std', name: 'Deluxe Hardcover', price: 349, mrp: 499, stock: 75 },
    ],
  },
  {
    id: 'PRD-9',
    name: 'Shuddh Guggal & Havan Samagri',
    nameHi: 'शुद्ध गुग्गल एवं वनौषधि हवन सामग्री',
    price: 299,
    mrp: 450,
    discountPct: 34,
    category: 'havan',
    subCategory: 'havan',
    categoryName: 'Havan Samagri',
    stock: 90,
    rating: 4.9,
    reviewsCount: 110,
    isBestseller: false,
    isFeatured: true,
    description: 'Blended with 51 sacred Himalayan herbs, pure Guggal, Loban, Nagarmotha and Jatamansi for purifying havan rituals.',
    features: ['51 Natural Herbs', 'No Artificial Chemical Smoke', 'Purifies Home Atmosphere'],
    specifications: [
      { label: 'Weight', value: '1 Kilogram' },
      { label: 'Herbs Count', value: '51 Authentic Vedic Herbs' },
    ],
    reviews: [
      { id: 'r10', user: 'Amit S.', rating: 5, date: '19 Oct 2026', verified: true, text: 'Fragrant and pure. Havan fumes feel very divine.' },
    ],
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v-havan-1kg', name: '1 Kg Sealed Pack', price: 299, mrp: 450, stock: 90 },
    ],
  },
  {
    id: 'PRD-10',
    name: 'Pure Brass Panchpatra & Achmani',
    nameHi: 'शुद्ध पीतल पंचपात्र एवं आचमनी सेट',
    price: 399,
    mrp: 599,
    discountPct: 33,
    category: 'bartan',
    subCategory: 'utensils',
    categoryName: 'Brass Utensils',
    stock: 65,
    rating: 4.8,
    reviewsCount: 92,
    isBestseller: false,
    description: 'Heavy gauge pure brass vessel with traditionally crafted engraved spoon for offering Gangajal and achaman during pooja rituals.',
    features: ['100% Solid Brass', 'Traditional Carving', 'Auspicious Ritual Utensil'],
    specifications: [
      { label: 'Material', value: 'Virgin Brass' },
      { label: 'Capacity', value: '150ml' },
    ],
    reviews: [
      { id: 'r11', user: 'Nitin J.', rating: 5, date: '17 Oct 2026', verified: true, text: 'Heavy quality brass. Fits comfortably in hand.' },
    ],
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v-panchpatra-std', name: 'Standard Brass Set', price: 399, mrp: 599, stock: 65 },
    ],
  },
  {
    id: 'PRD-11',
    name: 'Velvet Red Pooja Aasan & Pitham',
    nameHi: 'मखमली लाल जरीदार पूजा आसन',
    price: 199,
    mrp: 350,
    discountPct: 43,
    category: 'vastra',
    subCategory: 'aasan',
    categoryName: 'Vastra & Aasan',
    stock: 80,
    rating: 4.9,
    reviewsCount: 140,
    isBestseller: true,
    description: 'Premium soft velvet red cloth with golden zari lace border. Used as altar cloth for deities or sitting aasan during prayers.',
    features: ['Plush Rich Velvet', 'Golden Zari Embroidery', 'Durable and Washable'],
    specifications: [
      { label: 'Dimensions', value: '1 Meter x 1 Meter' },
      { label: 'Color', value: 'Sacred Crimson Red' },
    ],
    reviews: [
      { id: 'r12', user: 'Meena S.', rating: 5, date: '11 Oct 2026', verified: true, text: 'Shines beautifully under temple diya light. Very soft.' },
    ],
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v-aasan-std', name: '1x1 Meter Altar Aasan', price: 199, mrp: 350, stock: 80 },
    ],
  },
  {
    id: 'PRD-12',
    name: 'Kashi Vishwanath Prasad & Dry Fruit Bhog',
    nameHi: 'काशी विश्वनाथ शुद्ध प्रसाद एवं मेवा भोग',
    price: 350,
    mrp: 500,
    discountPct: 30,
    category: 'prasad',
    subCategory: 'prasad',
    categoryName: 'Prasad & Bhog',
    stock: 50,
    rating: 5.0,
    reviewsCount: 190,
    isBestseller: true,
    isFeatured: true,
    description: 'Consecrated pure Desi Ghee Besan Ladoo, Panchmeva dry fruits and holy vibhuti from Kashi Vishwanath Dham.',
    features: ['Pure Desi Ghee Preparation', 'Direct Temple Consecration', 'Hygienically Vacuum Packed'],
    specifications: [
      { label: 'Weight', value: '500 Grams' },
      { label: 'Contents', value: 'Temple Ladoo + Panchmeva + Vibhuti' },
    ],
    reviews: [
      { id: 'r13', user: 'Harish T.', rating: 5, date: '16 Oct 2026', verified: true, text: 'Blessed to receive authentic Kashi Prasad at home. Pure taste.' },
    ],
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
    ],
    variants: [
      { id: 'v-prasad-500g', name: '500g Temple Bhog Box', price: 350, mrp: 500, stock: 50 },
    ],
  },
];

export const DEMO_COUPONS = [
  { code: 'VAIDIC10', title: '10% Flat Discount on all orders', minOrder: 499, discountPercent: 10, maxDiscount: 150 },
  { code: 'SHUBH50', title: '₹50 Flat Discount on ₹500+', minOrder: 500, flatDiscount: 50 },
  { code: 'PRASAD100', title: '₹100 Discount on ₹999+', minOrder: 999, flatDiscount: 100 },
];

export const DEFAULT_SHIPPING_ADDRESS = {
  name: 'Rahul Sharma',
  phone: '9876543210',
  address: '101, Sunrise Apartment, Sector 12',
  city: 'New Delhi',
  state: 'Delhi',
  pincode: '110001',
};

class EStoreStore {
  constructor() {
    this.products = [...DEMO_STORE_PRODUCTS];
    this.cart = [
      {
        product: DEMO_STORE_PRODUCTS[0],
        variant: DEMO_STORE_PRODUCTS[0].variants[0],
        qty: 1,
      },
      {
        product: DEMO_STORE_PRODUCTS[2],
        variant: DEMO_STORE_PRODUCTS[2].variants[0],
        qty: 1,
      },
      {
        product: DEMO_STORE_PRODUCTS[1],
        variant: DEMO_STORE_PRODUCTS[1].variants[0],
        qty: 1,
      },
    ];
    this.wishlist = [
      DEMO_STORE_PRODUCTS[3],
      DEMO_STORE_PRODUCTS[4],
      DEMO_STORE_PRODUCTS[5],
      DEMO_STORE_PRODUCTS[6],
    ];
    this.appliedCoupon = null;
    this.selectedAddress = DEFAULT_SHIPPING_ADDRESS;
    this.orders = [
      {
        id: 'OD-102456',
        orderNumber: '#VS102456',
        placedAt: '16 Oct 2026, 10:24 AM',
        dateDisplay: 'Placed on 16 Oct 2026',
        expectedDelivery: '19 Oct 2026',
        status: 'PROCESSING',
        statusLabel: 'Processing',
        total: 699,
        items: [
          {
            name: 'Pooja Thali Set (Brass)',
            price: 599,
            qty: 1,
            image: DEMO_STORE_PRODUCTS[0].image,
          },
        ],
        address: DEFAULT_SHIPPING_ADDRESS,
        trackingEvents: [
          { status: 'Order Placed', time: '16 Oct 2026, 10:24 AM', completed: true },
          { status: 'Processing', time: '16 Oct 2026, 01:12 PM', completed: true },
          { status: 'Shipped', time: '17 Oct 2026, 09:30 AM', completed: true },
          { status: 'Out for Delivery', time: 'Expected: 19 Oct 2026', completed: false },
          { status: 'Delivered', time: 'Will be updated soon', completed: false },
        ],
      },
      {
        id: 'OD-102455',
        orderNumber: '#VS102455',
        placedAt: '14 Oct 2026, 02:30 PM',
        dateDisplay: 'Placed on 14 Oct 2026',
        expectedDelivery: '18 Oct 2026',
        status: 'SHIPPED',
        statusLabel: 'Shipped',
        total: 149,
        items: [
          {
            name: 'Agarbatti (Premium Chandan)',
            price: 149,
            qty: 1,
            image: DEMO_STORE_PRODUCTS[2].image,
          },
        ],
        address: DEFAULT_SHIPPING_ADDRESS,
        trackingEvents: [
          { status: 'Order Placed', time: '14 Oct 2026, 02:30 PM', completed: true },
          { status: 'Processing', time: '14 Oct 2026, 05:00 PM', completed: true },
          { status: 'Shipped', time: '15 Oct 2026, 11:15 AM', completed: true },
          { status: 'Out for Delivery', time: 'Expected: 18 Oct 2026', completed: false },
          { status: 'Delivered', time: 'Will be updated soon', completed: false },
        ],
      },
      {
        id: 'OD-102454',
        orderNumber: '#VS102454',
        placedAt: '10 Oct 2026, 11:10 AM',
        dateDisplay: 'Placed on 10 Oct 2026',
        expectedDelivery: '13 Oct 2026',
        status: 'DELIVERED',
        statusLabel: 'Delivered',
        total: 249,
        items: [
          {
            name: 'Brass Diya (Deepak)',
            price: 249,
            qty: 1,
            image: DEMO_STORE_PRODUCTS[1].image,
          },
        ],
        address: DEFAULT_SHIPPING_ADDRESS,
        trackingEvents: [
          { status: 'Order Placed', time: '10 Oct 2026, 11:10 AM', completed: true },
          { status: 'Processing', time: '10 Oct 2026, 01:00 PM', completed: true },
          { status: 'Shipped', time: '11 Oct 2026, 10:00 AM', completed: true },
          { status: 'Out for Delivery', time: '13 Oct 2026, 09:15 AM', completed: true },
          { status: 'Delivered', time: '13 Oct 2026, 03:45 PM', completed: true },
        ],
      },
    ];
    this.listeners = new Set();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.listeners.forEach((fn) => fn());
  }

  getCart() {
    return this.cart;
  }

  getProducts() {
    return this.products;
  }

  setProducts(products) {
    if (Array.isArray(products) && products.length > 0) {
      this.products = products;
    }
    this.notify();
  }

  // --- WISHLIST MANAGEMENT ---
  getWishlist() {
    return this.wishlist;
  }

  isInWishlist(productId) {
    const pId = String(productId);
    return this.wishlist.some((item) => String(item.id || item._id) === pId);
  }

  toggleWishlist(product) {
    if (!product) return;
    const pId = String(product.id || product._id);
    const index = this.wishlist.findIndex((item) => String(item.id || item._id) === pId);
    if (index > -1) {
      this.wishlist.splice(index, 1);
    } else {
      this.wishlist.push(product);
    }
    this.notify();
  }

  removeFromWishlist(productId) {
    const pId = String(productId);
    this.wishlist = this.wishlist.filter((item) => String(item.id || item._id) !== pId);
    this.notify();
  }

  // --- CART MANAGEMENT ---
  addToCart(product, variant, qty = 1) {
    if (!product) return;
    const v = variant || (Array.isArray(product.variants) && product.variants[0]) || {
      id: `v-${product.id || Date.now()}`,
      name: 'Standard Pack',
      price: Number(product.price || 0),
      mrp: Number(product.mrp || product.price || 0),
      stock: Number(product.stock != null ? product.stock : 25),
    };
    const vId = v.id || `v-${product.id}`;
    const pId = String(product.id || product._id);

    const existingIndex = this.cart.findIndex(
      (item) => String(item.product?.id || item.product?._id) === pId && (item.variant?.id === vId || !item.variant?.id)
    );

    if (existingIndex > -1) {
      this.cart[existingIndex].qty += qty;
    } else {
      this.cart.push({ product, variant: { ...v, id: vId }, qty });
    }
    this.notify();
  }

  updateQty(productId, variantId, qty) {
    const pId = String(productId);
    if (qty <= 0) {
      this.cart = this.cart.filter(
        (item) => !(String(item.product?.id || item.product?._id) === pId && (item.variant?.id === variantId || !variantId))
      );
    } else {
      const item = this.cart.find(
        (i) => String(i.product?.id || i.product?._id) === pId && (i.variant?.id === variantId || !variantId)
      );
      if (item) item.qty = Math.min(qty, 10);
    }
    this.notify();
  }

  removeFromCart(productId, variantId) {
    const pId = String(productId);
    this.cart = this.cart.filter(
      (item) => !(String(item.product?.id || item.product?._id) === pId && (item.variant?.id === variantId || !variantId))
    );
    this.notify();
  }

  clearCart() {
    this.cart = [];
    this.appliedCoupon = null;
    this.notify();
  }

  applyCoupon(couponCode) {
    const coupon = DEMO_COUPONS.find(
      (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase()
    );
    if (!coupon) return { success: false, message: 'अमान्य कूपन कोड' };

    const subtotal = this.getCartSubtotal();
    if (subtotal < coupon.minOrder) {
      return {
        success: false,
        message: `यह कूपन न्यूनतम ₹${coupon.minOrder} के ऑर्डर पर लागू होता है।`,
      };
    }

    this.appliedCoupon = coupon;
    this.notify();
    return { success: true, message: `कूपन "${coupon.code}" सफलतापूर्वक लागू हुआ!` };
  }

  removeCoupon() {
    this.appliedCoupon = null;
    this.notify();
  }

  getCartSubtotal() {
    return this.cart.reduce((sum, item) => {
      const price = Number(item.variant?.price || item.product?.price || 0);
      return sum + price * (item.qty || 1);
    }, 0);
  }

  getCartMrpTotal() {
    return this.cart.reduce((sum, item) => {
      const mrp = Number(item.variant?.mrp || item.variant?.price || item.product?.mrp || item.product?.price || 0);
      return sum + mrp * (item.qty || 1);
    }, 0);
  }

  getCalculations() {
    const mrpTotal = this.getCartMrpTotal();
    const subtotal = this.getCartSubtotal();
    const catalogDiscount = mrpTotal - subtotal;

    let couponDiscount = 0;
    if (this.appliedCoupon) {
      if (this.appliedCoupon.flatDiscount) {
        couponDiscount = this.appliedCoupon.flatDiscount;
      } else if (this.appliedCoupon.discountPercent) {
        couponDiscount = Math.min(
          Math.round((subtotal * this.appliedCoupon.discountPercent) / 100),
          this.appliedCoupon.maxDiscount || 9999
        );
      }
    }

    const deliveryFee = 0; // Free delivery in theme
    const finalTotal = Math.max(0, subtotal - couponDiscount + deliveryFee);

    return {
      mrpTotal,
      subtotal,
      catalogDiscount,
      couponDiscount,
      deliveryFee,
      itemCount: this.cart.reduce((sum, i) => sum + i.qty, 0),
      finalTotal,
    };
  }

  createOrder({ paymentMethod = 'UPI', address = this.selectedAddress, bookingId = null }) {
    const calcs = this.getCalculations();
    const orderNumber = '#VS' + Math.floor(100000 + Math.random() * 900000);
    const orderId = 'OD-' + Math.floor(10000 + Math.random() * 90000);

    const now = new Date();
    const placedDateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const placedTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newOrder = {
      id: orderId,
      orderNumber,
      bookingId,
      placedAt: `${placedDateStr}, ${placedTimeStr}`,
      dateDisplay: `Placed on ${placedDateStr}`,
      expectedDelivery: '3 - 5 Working Days',
      status: 'PROCESSING',
      statusLabel: 'Processing',
      items: this.cart.map((item) => ({
        name: item.product?.name || 'Vaidic Item',
        price: item.variant?.price || item.product?.price || 0,
        qty: item.qty,
        image: item.product?.images?.[0] || item.product?.image || item.product?.imageUrl,
      })),
      address: address ? { ...address } : DEFAULT_SHIPPING_ADDRESS,
      subtotal: calcs.subtotal,
      mrpTotal: calcs.mrpTotal,
      discount: calcs.catalogDiscount + calcs.couponDiscount,
      couponCode: this.appliedCoupon?.code || null,
      deliveryFee: calcs.deliveryFee,
      total: calcs.finalTotal,
      paymentMethod,
      trackingEvents: [
        { status: 'Order Placed', time: `${placedDateStr}, ${placedTimeStr}`, completed: true },
        { status: 'Processing', time: 'In Progress', completed: true },
        { status: 'Shipped', time: 'Expected within 24 hrs', completed: false },
        { status: 'Out for Delivery', time: 'Pending', completed: false },
        { status: 'Delivered', time: '3 - 5 Days', completed: false },
      ],
    };

    this.orders.unshift(newOrder);
    this.clearCart();
    this.notify();
    return newOrder;
  }
}

export const estoreStore = new EStoreStore();
export default estoreStore;
