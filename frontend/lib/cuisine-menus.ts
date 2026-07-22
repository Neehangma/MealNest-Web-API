export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  vegetarian?: boolean;
  spicy?: boolean;
};

export type MenuCategory = {
  name: string;
  items: MenuItem[];
};

export type CuisineMenu = {
  cuisine: string;
  categories: MenuCategory[];
};

const category = (name: string, items: Omit<MenuItem, "category">[]): MenuCategory => ({
  name,
  items: items.map((item) => ({ ...item, category: name })),
});

export const cuisineMenus: Record<string, CuisineMenu> = {
  thai: {
    cuisine: "Thai",
    categories: [
      category("Starters", [
        { id: "thai-chicken-satay", name: "Chicken Satay", description: "Grilled chicken skewers with peanut sauce.", price: 320 },
        { id: "thai-spring-rolls", name: "Vegetable Spring Rolls", description: "Crisp rolls with vegetables and sweet chili dip.", price: 240, vegetarian: true },
        { id: "thai-fish-cakes", name: "Thai Fish Cakes", description: "Herbed fish patties with cucumber relish.", price: 350, spicy: true },
      ]),
      category("Main Dishes", [
        { id: "thai-green-curry", name: "Green Curry Chicken", description: "Chicken, coconut milk, basil and green curry.", price: 520, spicy: true },
        { id: "thai-red-curry", name: "Red Curry Prawn", description: "Prawns simmered in fragrant red coconut curry.", price: 620, spicy: true },
        { id: "thai-basil-chicken", name: "Basil Chicken", description: "Wok-fried chicken with holy basil and chilies.", price: 480, spicy: true },
        { id: "thai-tom-kha", name: "Tom Kha Gai", description: "Coconut chicken soup with galangal and lime.", price: 450 },
      ]),
      category("Rice & Noodles", [
        { id: "thai-pad-see-ew", name: "Pad See Ew", description: "Wide rice noodles with vegetables and soy sauce.", price: 420 },
        { id: "thai-pad-thai", name: "Pad Thai", description: "Rice noodles with tamarind, peanuts and bean sprouts.", price: 450 },
        { id: "thai-pineapple-rice", name: "Pineapple Fried Rice", description: "Jasmine rice with pineapple, cashews and vegetables.", price: 430, vegetarian: true },
        { id: "thai-jasmine-rice", name: "Thai Jasmine Rice", description: "Steamed aromatic jasmine rice.", price: 180, vegetarian: true },
      ]),
      category("Desserts", [
        { id: "thai-mango-rice", name: "Mango Sticky Rice", description: "Sweet coconut rice with fresh mango.", price: 280, vegetarian: true },
        { id: "thai-coconut-ice", name: "Coconut Ice Cream", description: "Creamy coconut ice cream with toasted coconut.", price: 220, vegetarian: true },
      ]),
      category("Drinks", [
        { id: "thai-iced-tea", name: "Thai Iced Tea", description: "Sweet spiced tea with milk and ice.", price: 180, vegetarian: true },
        { id: "thai-lime-soda", name: "Fresh Lime Soda", description: "Fresh lime, soda and a touch of sweetness.", price: 160, vegetarian: true },
        { id: "thai-watermelon", name: "Watermelon Juice", description: "Fresh blended watermelon juice.", price: 190, vegetarian: true },
        { id: "thai-water", name: "Mineral Water", description: "Chilled bottled mineral water.", price: 100, vegetarian: true },
      ]),
    ],
  },
  italian: {
    cuisine: "Italian",
    categories: [
      category("Starters", [
        { id: "italian-bruschetta", name: "Bruschetta", description: "Toasted bread with tomato, basil and olive oil.", price: 280, vegetarian: true },
        { id: "italian-garlic-bread", name: "Garlic Bread", description: "Oven-baked bread with garlic herb butter.", price: 220, vegetarian: true },
      ]),
      category("Main Dishes", [
        { id: "italian-margherita", name: "Margherita Pizza", description: "Tomato, mozzarella and fresh basil.", price: 560, vegetarian: true },
        { id: "italian-pepperoni", name: "Pepperoni Pizza", description: "Mozzarella, tomato and pepperoni.", price: 680 },
        { id: "italian-carbonara", name: "Spaghetti Carbonara", description: "Spaghetti with egg, cheese and smoked bacon.", price: 590 },
        { id: "italian-arrabbiata", name: "Penne Arrabbiata", description: "Penne in a spicy tomato and garlic sauce.", price: 480, vegetarian: true, spicy: true },
        { id: "italian-lasagna", name: "Lasagna", description: "Layered pasta with beef ragù and béchamel.", price: 650 },
      ]),
      category("Side Dishes", [
        { id: "italian-salad", name: "Insalata Mista", description: "Mixed greens with balsamic dressing.", price: 260, vegetarian: true },
      ]),
      category("Desserts", [
        { id: "italian-tiramisu", name: "Tiramisu", description: "Coffee-soaked sponge with mascarpone cream.", price: 320, vegetarian: true },
      ]),
      category("Drinks", [
        { id: "italian-soda", name: "Italian Soda", description: "Sparkling soda with fruit syrup.", price: 190, vegetarian: true },
        { id: "italian-lemonade", name: "Lemonade", description: "Fresh lemon juice served chilled.", price: 170, vegetarian: true },
        { id: "italian-water", name: "Mineral Water", description: "Chilled bottled mineral water.", price: 100, vegetarian: true },
      ]),
    ],
  },
  japanese: {
    cuisine: "Japanese",
    categories: [
      category("Starters", [
        { id: "japanese-edamame", name: "Edamame", description: "Steamed soybeans finished with sea salt.", price: 220, vegetarian: true },
        { id: "japanese-gyoza", name: "Gyoza", description: "Pan-seared chicken and vegetable dumplings.", price: 340 },
        { id: "japanese-karaage", name: "Chicken Karaage", description: "Crispy soy-marinated Japanese fried chicken.", price: 390 },
      ]),
      category("Main Dishes", [
        { id: "japanese-salmon-sushi", name: "Salmon Sushi", description: "Fresh salmon nigiri with seasoned rice.", price: 620 },
        { id: "japanese-california-roll", name: "California Roll", description: "Crab, avocado and cucumber sushi roll.", price: 520 },
        { id: "japanese-teriyaki", name: "Chicken Teriyaki", description: "Grilled chicken glazed with teriyaki sauce.", price: 580 },
      ]),
      category("Rice & Noodles", [
        { id: "japanese-veg-ramen", name: "Vegetable Ramen", description: "Noodles and vegetables in a savory broth.", price: 470, vegetarian: true },
        { id: "japanese-beef-ramen", name: "Beef Ramen", description: "Slow-cooked beef, noodles and seasoned broth.", price: 590 },
      ]),
      category("Desserts", [
        { id: "japanese-mochi", name: "Mochi Ice Cream", description: "Soft rice cakes filled with ice cream.", price: 280, vegetarian: true },
      ]),
      category("Drinks", [
        { id: "japanese-green-tea", name: "Green Tea", description: "Warm Japanese green tea.", price: 140, vegetarian: true },
        { id: "japanese-ramune", name: "Ramune", description: "Classic Japanese marble soda.", price: 220, vegetarian: true },
        { id: "japanese-water", name: "Mineral Water", description: "Chilled bottled mineral water.", price: 100, vegetarian: true },
      ]),
    ],
  },
  indian: {
    cuisine: "Indian",
    categories: [
      category("Starters", [
        { id: "indian-samosa", name: "Vegetable Samosa", description: "Crisp pastry filled with spiced potato and peas.", price: 180, vegetarian: true, spicy: true },
        { id: "indian-paneer-tikka", name: "Paneer Tikka", description: "Chargrilled cottage cheese with peppers and spices.", price: 380, vegetarian: true, spicy: true },
        { id: "indian-chicken-tikka", name: "Chicken Tikka", description: "Yogurt-marinated chicken roasted in the tandoor.", price: 440, spicy: true },
      ]),
      category("Main Dishes", [
        { id: "indian-butter-chicken", name: "Butter Chicken", description: "Tandoori chicken in a creamy tomato gravy.", price: 560 },
        { id: "indian-palak-paneer", name: "Palak Paneer", description: "Paneer cubes in a seasoned spinach gravy.", price: 470, vegetarian: true },
      ]),
      category("Rice & Noodles", [
        { id: "indian-chicken-biryani", name: "Chicken Biryani", description: "Aromatic basmati rice layered with spiced chicken.", price: 520, spicy: true },
        { id: "indian-veg-biryani", name: "Vegetable Biryani", description: "Basmati rice cooked with vegetables and spices.", price: 420, vegetarian: true, spicy: true },
      ]),
      category("Side Dishes", [
        { id: "indian-garlic-naan", name: "Garlic Naan", description: "Tandoor-baked flatbread with garlic butter.", price: 150, vegetarian: true },
      ]),
      category("Desserts", [
        { id: "indian-gulab-jamun", name: "Gulab Jamun", description: "Warm milk dumplings soaked in cardamom syrup.", price: 190, vegetarian: true },
      ]),
      category("Drinks", [
        { id: "indian-mango-lassi", name: "Mango Lassi", description: "Chilled yogurt drink blended with mango.", price: 210, vegetarian: true },
        { id: "indian-masala-tea", name: "Masala Tea", description: "Milk tea brewed with warming spices.", price: 130, vegetarian: true },
        { id: "indian-water", name: "Mineral Water", description: "Chilled bottled mineral water.", price: 100, vegetarian: true },
      ]),
    ],
  },
  chinese: {
    cuisine: "Chinese",
    categories: [
      category("Starters", [
        { id: "chinese-spring-rolls", name: "Spring Rolls", description: "Crispy vegetable rolls with chili sauce.", price: 240, vegetarian: true },
        { id: "chinese-dumplings", name: "Chicken Dumplings", description: "Steamed dumplings with seasoned chicken filling.", price: 330 },
        { id: "chinese-hot-sour", name: "Hot and Sour Soup", description: "Peppery soup with mushrooms, tofu and vegetables.", price: 280, spicy: true },
      ]),
      category("Main Dishes", [
        { id: "chinese-kung-pao", name: "Kung Pao Chicken", description: "Chicken, peanuts and vegetables in chili sauce.", price: 520, spicy: true },
        { id: "chinese-sweet-sour", name: "Sweet and Sour Chicken", description: "Crispy chicken with pineapple and peppers.", price: 500 },
        { id: "chinese-mapo-tofu", name: "Mapo Tofu", description: "Silken tofu in a bold Sichuan chili sauce.", price: 430, vegetarian: true, spicy: true },
      ]),
      category("Rice & Noodles", [
        { id: "chinese-chow-mein", name: "Chicken Chow Mein", description: "Wok-fried noodles with chicken and vegetables.", price: 420 },
        { id: "chinese-fried-rice", name: "Vegetable Fried Rice", description: "Wok-tossed rice with vegetables and scallions.", price: 360, vegetarian: true },
      ]),
      category("Desserts", [
        { id: "chinese-sesame-balls", name: "Sesame Balls", description: "Crisp glutinous rice balls with sweet filling.", price: 220, vegetarian: true },
      ]),
      category("Drinks", [
        { id: "chinese-tea", name: "Chinese Tea", description: "Freshly brewed jasmine tea.", price: 140, vegetarian: true },
        { id: "chinese-lemon-soda", name: "Lemon Soda", description: "Sparkling soda with fresh lemon.", price: 170, vegetarian: true },
        { id: "chinese-water", name: "Mineral Water", description: "Chilled bottled mineral water.", price: 100, vegetarian: true },
      ]),
    ],
  },
  nepali: {
    cuisine: "Nepali",
    categories: [
      category("Starters", [
        { id: "nepali-momo", name: "Momo", description: "Steamed chicken dumplings with tomato achar.", price: 280, spicy: true },
        { id: "nepali-sekuwa", name: "Sekuwa", description: "Chargrilled marinated chicken with Nepali spices.", price: 420, spicy: true },
        { id: "nepali-chatamari", name: "Chatamari", description: "Newari rice crêpe topped with vegetables and egg.", price: 300 },
      ]),
      category("Main Dishes", [
        { id: "nepali-dal-bhat", name: "Dal Bhat Tarkari", description: "Rice, lentils, seasonal curry, pickle and greens.", price: 450, vegetarian: true },
        { id: "nepali-thakali", name: "Thakali Khana Set", description: "Traditional rice set with dal, curries and achar.", price: 620 },
        { id: "nepali-newari", name: "Newari Khaja Set", description: "Beaten rice platter with classic Newari accompaniments.", price: 580, spicy: true },
      ]),
      category("Rice & Noodles", [
        { id: "nepali-chow-mein", name: "Chow Mein", description: "Nepali-style stir-fried noodles with vegetables.", price: 330, vegetarian: true, spicy: true },
      ]),
      category("Side Dishes", [
        { id: "nepali-sel-roti", name: "Sel Roti", description: "Traditional lightly sweet rice-flour ring bread.", price: 160, vegetarian: true },
      ]),
      category("Desserts", [
        { id: "nepali-juju-dhau", name: "Juju Dhau", description: "Rich Bhaktapur-style sweet yogurt.", price: 190, vegetarian: true },
      ]),
      category("Drinks", [
        { id: "nepali-masala-tea", name: "Masala Tea", description: "Nepali milk tea with aromatic spices.", price: 120, vegetarian: true },
        { id: "nepali-lassi", name: "Lassi", description: "Cool, lightly sweet yogurt drink.", price: 180, vegetarian: true },
        { id: "nepali-water", name: "Mineral Water", description: "Chilled bottled mineral water.", price: 100, vegetarian: true },
      ]),
    ],
  },
  korean: {
    cuisine: "Korean",
    categories: [
      category("Starters", [
        { id: "korean-kimchi-pancake", name: "Kimchi Pancake", description: "Crisp savory pancake with fermented kimchi.", price: 320, vegetarian: true, spicy: true },
        { id: "korean-mandu", name: "Mandu", description: "Pan-fried Korean chicken and vegetable dumplings.", price: 350 },
        { id: "korean-tteokbokki", name: "Tteokbokki", description: "Rice cakes in a sweet and spicy gochujang sauce.", price: 380, vegetarian: true, spicy: true },
      ]),
      category("Main Dishes", [
        { id: "korean-bibimbap", name: "Bibimbap", description: "Rice bowl with vegetables, egg and gochujang.", price: 480, vegetarian: true, spicy: true },
        { id: "korean-bulgogi", name: "Bulgogi", description: "Grilled marinated beef with onions and sesame.", price: 650 },
        { id: "korean-fried-chicken", name: "Korean Fried Chicken", description: "Crispy chicken glazed with spicy-sweet sauce.", price: 590, spicy: true },
      ]),
      category("Rice & Noodles", [
        { id: "korean-kimchi-rice", name: "Kimchi Fried Rice", description: "Wok-fried rice with kimchi and a fried egg.", price: 420, spicy: true },
        { id: "korean-japchae", name: "Japchae", description: "Sweet potato noodles with vegetables and sesame.", price: 440, vegetarian: true },
      ]),
      category("Desserts", [
        { id: "korean-hotteok", name: "Hotteok", description: "Warm sweet pancake with cinnamon and nuts.", price: 240, vegetarian: true },
      ]),
      category("Drinks", [
        { id: "korean-citron-tea", name: "Korean Citron Tea", description: "Warm yuja tea with fragrant citrus.", price: 170, vegetarian: true },
        { id: "korean-soft-drink", name: "Soft Drink", description: "Chilled canned soft drink.", price: 140, vegetarian: true },
        { id: "korean-water", name: "Mineral Water", description: "Chilled bottled mineral water.", price: 100, vegetarian: true },
      ]),
    ],
  },
  mediterranean: {
    cuisine: "Mediterranean",
    categories: [
      category("Starters", [
        { id: "med-hummus", name: "Hummus & Pita", description: "Creamy chickpea dip with warm pita bread.", price: 300, vegetarian: true },
        { id: "med-falafel", name: "Falafel", description: "Crisp herb chickpea fritters with tahini.", price: 340, vegetarian: true },
        { id: "med-calamari", name: "Crispy Calamari", description: "Lightly fried calamari with lemon aioli.", price: 520 },
      ]),
      category("Main Dishes", [
        { id: "med-chicken-souvlaki", name: "Chicken Souvlaki", description: "Grilled chicken skewers with pita and tzatziki.", price: 560 },
        { id: "med-lamb-kofta", name: "Lamb Kofta", description: "Spiced lamb skewers with herb salad.", price: 680, spicy: true },
        { id: "med-moussaka", name: "Vegetable Moussaka", description: "Layered aubergine, tomato and béchamel.", price: 520, vegetarian: true },
      ]),
      category("Side Dishes", [
        { id: "med-greek-salad", name: "Greek Salad", description: "Tomato, cucumber, olives and feta.", price: 360, vegetarian: true },
        { id: "med-roasted-potatoes", name: "Lemon Roasted Potatoes", description: "Herb-roasted potatoes with lemon.", price: 260, vegetarian: true },
      ]),
      category("Desserts", [
        { id: "med-baklava", name: "Baklava", description: "Layered pastry with nuts and honey syrup.", price: 290, vegetarian: true },
      ]),
      category("Drinks", [
        { id: "med-mint-lemonade", name: "Mint Lemonade", description: "Fresh lemon blended with mint.", price: 190, vegetarian: true },
        { id: "med-coffee", name: "Turkish Coffee", description: "Rich traditional finely ground coffee.", price: 170, vegetarian: true },
        { id: "med-water", name: "Mineral Water", description: "Chilled bottled mineral water.", price: 100, vegetarian: true },
      ]),
    ],
  },
};

export function getCuisineMenu(cuisine?: string, restaurantOverride?: CuisineMenu) {
  if (restaurantOverride) return restaurantOverride;
  const normalizedCuisine = cuisine?.trim().toLowerCase();
  return normalizedCuisine ? cuisineMenus[normalizedCuisine] : undefined;
}
