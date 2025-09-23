// src/utils/seedCategories.ts
import dotenv from 'dotenv';
dotenv.config();

import Category from '../models/CategoryModel';
import connectDB from '../config/db';

// Utility function to generate slug from name
const generateSlug = (name: string) =>
  name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

const rawCategories = [
  {
    name: 'Laboratory Equipment',
    description: 'High-quality laboratory equipment and instruments for research and analysis',
    featured: true
  },
  {
    name: 'Biotechnology Tools',
    description: 'Advanced biotechnology tools and instruments for genetic research',
    featured: true
  },
  {
    name: 'Medical Devices',
    description: 'Medical devices and equipment for healthcare professionals',
    featured: false
  },
  {
    name: 'Research Chemicals',
    description: 'Pure research chemicals and reagents for laboratory use',
    featured: false
  },
  {
    name: 'Analytical Instruments',
    description: 'Precision analytical instruments for scientific measurements',
    featured: true
  },
  {
    name: 'Microscopy',
    description: 'Advanced microscopy equipment for detailed sample analysis',
    featured: false
  },
  {
    name: 'Cell Culture',
    description: 'Cell culture media, supplements, and equipment',
    featured: false
  },
  {
    name: 'Molecular Biology',
    description: 'Tools and reagents for molecular biology research',
    featured: true
  }
];

// Add slug to each category
const categories = rawCategories.map(cat => ({
  ...cat,
  slug: generateSlug(cat.name)
}));

const seedCategories = async () => {
  try {
    await connectDB();

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedCategories();
}

export default seedCategories;
