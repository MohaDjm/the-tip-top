// backend/src/scripts/generateCodes.ts
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const TOTAL_CODES = 500000;

const gains = [
  { name: 'Infuseur à thé', value: 39, percentage: 0.60, exactCount: 300000 },
  { name: 'Boîte de 100g thé détox ou infusion', value: 49, percentage: 0.20, exactCount: 100000 },
  { name: 'Boîte de 100g thé signature', value: 59, percentage: 0.10, exactCount: 50000 },
  { name: 'Coffret découverte 39€', value: 39, percentage: 0.06, exactCount: 30000 },
  { name: 'Coffret découverte 69€', value: 69, percentage: 0.04, exactCount: 20000 }
];

async function generateCodes() {
  try {
    console.log('🚀 Starting code generation process...');
    console.log(`📊 Total codes to generate: ${TOTAL_CODES.toLocaleString()}`);
    
    // Clear existing data (optional - uncomment if needed)
    // console.log('🗑️ Clearing existing data...');
    // await prisma.code.deleteMany();
    // await prisma.gain.deleteMany();

    // Créer les gains dans la base de données
    const createdGains: any[] = [];
    
    for (const gain of gains) {
      const quantity = gain.exactCount;
      console.log(`   Creating ${gain.name}: ${quantity.toLocaleString()} codes (${(gain.percentage * 100).toFixed(1)}%)`);
      
      // Vérifier si le gain existe déjà
      const existingGain = await prisma.gain.findFirst({
        where: { name: gain.name }
      });
      
      if (existingGain) {
        console.log(`   ⚠️  Gain "${gain.name}" already exists, skipping creation`);
        createdGains.push({ ...existingGain, quantity });
      } else {
        const created = await prisma.gain.create({
          data: {
            name: gain.name,
            value: gain.value,
            description: `${gain.name} d'une valeur de ${gain.value}€`,
            quantity: quantity,
            remainingQuantity: quantity
          }
        });
        
        createdGains.push({ ...created, quantity });
      }
    }

    console.log('✅ Gains created successfully');

    // Générer les codes
    console.log('🔢 Generating codes...');
    const codes = [];
    const usedCodes = new Set<string>();
    let codeIndex = 0;

    for (const gain of createdGains) {
      console.log(`   Generating codes for ${gain.name}...`);
      
      for (let i = 0; i < gain.quantity; i++) {
        let code: string;
        let attempts = 0;
        const maxAttempts = 10;

        // Ensure unique code generation
        do {
          code = generateUniqueCode();
          attempts++;
          
          if (attempts > maxAttempts) {
            throw new Error(`Failed to generate unique code after ${maxAttempts} attempts`);
          }
        } while (usedCodes.has(code));

        usedCodes.add(code);
        codes.push({
          code: code,
          gainId: gain.id,
          isUsed: false
        });
        
        codeIndex++;
        
        // Progress indicator
        if (codeIndex % 10000 === 0) {
          console.log(`   Generated ${codeIndex.toLocaleString()}/${TOTAL_CODES.toLocaleString()} codes`);
        }
      }
    }

    console.log(`✅ Generated ${codes.length.toLocaleString()} unique codes`);

    // Mélanger les codes pour une distribution aléatoire
    console.log('🔀 Shuffling codes...');
    codes.sort(() => Math.random() - 0.5);

    // Insérer par batch pour optimiser les performances
    console.log('💾 Inserting codes into database...');
    const batchSize = 1000;
    let insertedCount = 0;

    for (let i = 0; i < codes.length; i += batchSize) {
      const batch = codes.slice(i, i + batchSize);
      
      try {
        await prisma.code.createMany({ 
          data: batch,
          skipDuplicates: true 
        });
        
        insertedCount += batch.length;
        console.log(`   Inserted ${insertedCount.toLocaleString()}/${codes.length.toLocaleString()} codes (${((insertedCount / codes.length) * 100).toFixed(1)}%)`);
        
      } catch (error) {
        console.error(`❌ Error inserting batch starting at index ${i}:`, error);
        throw error;
      }
    }

    // Vérification finale
    console.log('🔍 Verifying insertion...');
    const totalInserted = await prisma.code.count();
    const gainStats = await prisma.gain.findMany({
      include: {
        _count: {
          select: { codes: true }
        }
      }
    });

    console.log('\n📈 Final Statistics:');
    console.log(`   Total codes in database: ${totalInserted.toLocaleString()}`);
    console.log('   Distribution by gain:');
    
    for (const gain of gainStats) {
      const percentage = ((gain._count.codes / totalInserted) * 100).toFixed(2);
      console.log(`     ${gain.name}: ${gain._count.codes.toLocaleString()} codes (${percentage}%)`);
    }

    console.log('\n🎉 Code generation completed successfully!');

  } catch (error) {
    console.error('❌ Error during code generation:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function generateUniqueCode(): string {
  // Generate 10-digit code to respect VarChar(10) limit
  return Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
}

// Fonction utilitaire pour nettoyer la base de données (à utiliser avec précaution)
async function clearDatabase() {
  console.log('⚠️ WARNING: This will delete all existing codes and gains!');
  console.log('🗑️ Clearing database...');
  
  await prisma.participation.deleteMany();
  await prisma.code.deleteMany();
  await prisma.gain.deleteMany();
  
  console.log('✅ Database cleared');
}

// Fonction pour afficher les statistiques actuelles
async function showStats() {
  const totalCodes = await prisma.code.count();
  const totalGains = await prisma.gain.count();
  const usedCodes = await prisma.code.count({ where: { isUsed: true } });
  
  console.log('\n📊 Current Database Statistics:');
  console.log(`   Total gains: ${totalGains}`);
  console.log(`   Total codes: ${totalCodes.toLocaleString()}`);
  console.log(`   Used codes: ${usedCodes.toLocaleString()}`);
  console.log(`   Available codes: ${(totalCodes - usedCodes).toLocaleString()}`);
  
  if (totalGains > 0) {
    const gainStats = await prisma.gain.findMany({
      include: {
        _count: {
          select: { codes: true }
        }
      }
    });
    
    console.log('\n   Distribution by gain:');
    for (const gain of gainStats) {
      const percentage = totalCodes > 0 ? ((gain._count.codes / totalCodes) * 100).toFixed(2) : '0.00';
      console.log(`     ${gain.name}: ${gain._count.codes.toLocaleString()} codes (${percentage}%)`);
    }
  }
}

// Script principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'generate':
      await generateCodes();
      break;
    case 'clear':
      await clearDatabase();
      break;
    case 'stats':
      await showStats();
      break;
    default:
      console.log('Usage:');
      console.log('  npm run generate-codes generate  # Generate all codes');
      console.log('  npm run generate-codes clear     # Clear database (WARNING: destructive)');
      console.log('  npm run generate-codes stats     # Show current statistics');
      break;
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

export { generateCodes, clearDatabase, showStats };
